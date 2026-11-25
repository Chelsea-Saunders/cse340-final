import pool from '../db/pgSQL.js';
import * as cartModel from './cartModel.js';

// checkout validation (helps distinguish expected checkout problems from unexpected database or server errors)
export class CheckoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CheckoutError';
    }
}

export const createOrder = async (order, sessionId, checkoutSnapshot) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // identify products with active reservations
        const reservationResult = await client.query(
            `SELECT product_id
            FROM inventory_reservations
            WHERE session_id = $1
                AND expires_at > clock_timestamp()
            ORDER BY product_id`,
            [sessionId]
        );

        // prevent checkout with an empty/expired cart
        if (reservationResult.rows.length === 0) {
            throw new CheckoutError(
                'Your cart is empty or your reservation has expired'
            );
        }

        const productIds = reservationResult.rows.map(
            row => row.product_id
        )

        // lock reserved products in consistent ID order
        const productResult = await client.query(
            `SELECT id, name, price, stock_quantity
            FROM products
            WHERE id = ANY($1::integer[])
            ORDER BY id
            FOR UPDATE`,
            [productIds]
        );

        // verify all products are still available
        if (productResult.rows.length !== productIds.length) {
            throw new CheckoutError(
                'A product in your cart is no longer available'
            );
        }

        // recheck customers active reservation
        const activeResult = await client.query(
            `SELECT id, product_id, quantity, expires_at
            FROM inventory_reservations
            WHERE session_id = $1
                AND product_id = ANY($2::integer[])
                AND expires_at > clock_timestamp()
            ORDER BY product_id
            FOR UPDATE`,
            [sessionId, productIds]
        );

        if (activeResult.rows.length !== productIds.length) {
            throw new CheckoutError(
                'Your cart has changed or a reservation has expired. Please review your cart'
            );
        }

        // validate inventory and prepare order items
        const items = activeResult.rows.map(reservation => {
            const product = productResult.rows.find(
                product => product.id === reservation.product_id
            );

            if (
                !Number.isInteger(reservation.quantity) ||
                reservation.quantity < 1 ||
                reservation.quantity > 10
            ) {
                throw new CheckoutError(
                    'Your cart contains an invalid quantity'
                );
            }

            if (
                !product ||
                product.stock_quantity < reservation.quantity
            ) {
                throw new CheckoutError(
                    'A product in your cart has insufficient inventory'
                );
            }

            return {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: reservation.quantity,
                reservationId: reservation.id,
                expiresAt: reservation.expires_at
            };
        });

        // build a snapshot
        const databaseSnapshot = items.map(item => ({
            reservationId: String(item.reservationId),
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            expiresAt: new Date(item.expiresAt).toISOString()
        }));

        if (
            !Array.isArray(checkoutSnapshot) || 
            checkoutSnapshot.length === 0
        ) {
            throw new CheckoutError(
                'Please review your cart before placing an order'
            );
        }

        //sort snapshots for comparison
        const sortedCheckoutSnapshot = [
            ...checkoutSnapshot].sort(
                (a, b) => a.productId - b.productId
            );

        const sortedDataSnapshot = [
            ...databaseSnapshot].sort(
                (a, b) => a.productId - b.productId
            );

        // verify cart matches what customer reviewed
        if (
            JSON.stringify(sortedCheckoutSnapshot) !==
            JSON.stringify(sortedDataSnapshot)
        ) {
            throw new CheckoutError(
                'Your cart has changed. Please reveiw your cart before placing your order.'
            );
        }

        // verify inventory against active reservations
        for (const product of productResult.rows) {
            const reservedResult = await client.query(
                `SELECT COALESCE(SUM(quantity), 0) AS reserved
                FROM inventory_reservations
                WHERE product_id = $1
                    AND expires_at > clock_timestamp()`,
                [product.id]
            );

            const reserved = Number(
                reservedResult.rows[0].reserved
            );

            if (reserved > product.stock_quantity) {
                throw new CheckoutError(
                    'Inventory has changed. Please review your cart.'
                );
            }
        }

        // calculate order total with database prices
        const total = cartModel.getCartTotal(items);

        if (!Number.isFinite(total) || total < 0 || total > 99999999.99) {
            throw new CheckoutError(
                'Unable to calculate your order total'
            );
        }

        // verify reservations haven't expired during checkout
        const expirationResult = await client.query(
            `SELECT id
            FROM inventory_reservations
            WHERE session_id = $1
                AND id = ANY($2::bigint[])
                AND expires_at > statement_timestamp()`,
            [sessionId, items.map(item => item.reservationId)]
        );

        if (expirationResult.rows.length !== items.length) {
            throw new CheckoutError(
                'Your reservation has expired. Please review your cart'
            );
        }

        const orderResult = await client.query(
            `INSERT INTO orders (
                user_id,
                full_name, 
                address, 
                city, 
                state, 
                zip, 
                total
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id`,
            [
                order.userId, 
                order.fullName, 
                order.address, 
                order.city,
                order.state,
                order.zip,
                total
            ]
        );

        const orderId = orderResult.rows[0].id;

        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (
                    order_id, 
                    product_id, 
                    product_name, 
                    quantity, 
                    unit_price
                    )
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    orderId, 
                    item.id, 
                    item.name,
                    item.quantity,
                    item.price
                ]
            );

            // deduct purchased inventory
            const stockResult = await client.query(
                `UPDATE products
                SET stock_quantity = stock_quantity - $1
                WHERE id = $2
                    AND stock_quantity >= $1
                RETURNING stock_quantity`,
                [item.quantity, item.id]
            );

            if (stockResult.rowCount !== 1) {
                throw new CheckoutError(
                    'A product in your cart has insufficient inventory'
                );
            }

        }

        // delete purchases reservations
        const deleteResult = await client.query(
            `DELETE FROM inventory_reservations
            WHERE session_id = $1
                AND id = ANY($2::bigint[])`,
            [sessionId, items.map(item => item.reservationId)]
        );

        if (deleteResult.rowCount !== items.length) {
            throw new CheckoutError(
                'Unable to finalize your cart reservations'
            );
        }

        await client.query('COMMIT');

        return orderId;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// check order id and user to prevent customer from viewing anyone else's order
export const getOrderById = async (orderId, userId) => {
    const result = await pool.query(
        `SELECT 
            id,  
            total, 
            status, 
            created_at
        FROM orders
        WHERE id = $1
            AND user_id = $2`,
        [orderId, userId]
    );

    return result.rows[0] || null;
};

// get customers orders
export const getOrderByUserId = async (userId) => {
    const result = await pool.query(
        `SELECT
            id, 
            total,
            status,
            created_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC`,
        [userId]
    );

    return result.rows;
};

// retrieve order items
export const getOrderItems = async (orderId) => {
    const result = await pool.query(
        `SELECT 
            product_name,
            quantity,
            unit_price
        FROM order_items
        WHERE order_id = $1
        ORDER BY id`,
        [orderId]
    );

    return result.rows;
};