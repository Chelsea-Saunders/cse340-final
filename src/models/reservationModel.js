import pool from '../db/pgSQL.js';

export const getCartItems = async (sessionId) => {
    const result = await pool.query(
        `SELECT
            p.id, 
            p.name,
            p.price,
            COALESCE(p.image_med, p.image_sm) AS image,
            r.quantity,
            r.expires_at
        FROM inventory_reservations r
        JOIN products p 
            ON p.id = r.product_id
        WHERE r.session_id = $1
            AND r.expires_at > NOW()
        ORDER BY r.reserved_at ASC`,
        [sessionId]
    );

    return result.rows.map(item=> ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        quantity: item.quantity,
        subtotal: Number(item.price) * item.quantity,
        expiresAt: item.expires_at
    }));
};

export const reserveProduct = async (sessionId, productId, quantity) => {
    if (!Number.isSafeInteger(Number(productId)) ||
        Number(productId) <= 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1) {
            throw new Error('Invalid product or quantity');
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // only allow one item in a cart at a time(no duplicate orders)
        const productResult = await client.query(
            `SELECT stock_quantity
            FROM products
            WHERE id = $1
            FOR UPDATE`,
            [productId]
        );

        if (productResult.rows.length === 0) {
            throw new Error('Product not found');
        }

        const stockQuantity = productResult.rows[0].stock_quantity;

        // customer's current reservation
        const currentResult = await client.query(
            `SELECT quantity, expires_at
            FROM inventory_reservations
            WHERE session_id = $1
                AND product_id = $2
                AND expires_at > NOW()`,
            [sessionId, productId]
        );

        const existing = currentResult.rows[0];
        const newQuantity = (existing?.quantity || 0) + quantity;

        if (newQuantity > 10) {
            throw new Error('Invalid cart quantity');
        }

        // count all current reservations across all users
        const reservedResult = await client.query(
            `SELECT COALESCE(SUM(quantity), 0)::integer AS reserved
            FROM inventory_reservations
            WHERE product_id = $1
                AND expires_at > NOW()`,
            [productId]
        );

        const reserved = reservedResult.rows[0].reserved;

        if (reserved + quantity > stockQuantity) {
            throw new Error('Cannot add more items to your cart than are available');
        }

        // update (or create) reservation
        await client.query(
            `INSERT INTO inventory_reservations
                (session_id, product_id, quantity, expires_at)
            VALUES (
                $1, $2, $3, NOW() + INTERVAL '15 minutes'
            )
            ON CONFLICT (session_id, product_id)
            DO UPDATE SET
                quantity = EXCLUDED.quantity,
                reserved_at = CASE
                WHEN inventory_reservations.expires_at <= NOW()
                THEN NOW()
                ELSE inventory_reservations.reserved_at
            END,
            expires_at = CASE
                WHEN inventory_reservations.expires_at <= NOW()
                THEN EXCLUDED.expires_at
                ELSE inventory_reservations.expires_at
            END`,
            [sessionId, productId, newQuantity]
        );

        await client.query('COMMIT');
        return newQuantity;
    } catch(err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// update the quantity of any existing reservation
export const updateReservationQuantity = async (
    sessionId, 
    productId, 
    quantity
) => {
    if (
        !Number.isSafeInteger(Number(productId)) ||
        Number(productId) <= 0 ||
        !Number.isInteger(quantity) || 
        quantity < 0 ||
        quantity > 10
    ) {
        throw new Error('Invalid product or quantity');
    }

    const client = await pool.connect();

    try {
        await client.query('Begin');

        const productResult = await client.query(
            `SELECT stock_quantity
            FROM products
            WHERE id = $1
            FOR UPDATE`,
            [productId]
        );

        if (productResult.rows.length === 0) {
            throw new Error('Product not found');
        }

        const currentResult = await client.query(
            `SELECT quantity
            FROM inventory_reservations
            WHERE session_id = $1
                AND product_id = $2
                AND expires_at > NOW()`,
            [sessionId, productId]
        );

        const existing = currentResult.rows[0];

        if (!existing) {
            throw new Error('Reservation expired or not found');
        }

        if (quantity === 0) {
            await client.query(
                `DELETE FROM inventory_reservations
                WHERE session_id = $1
                    AND product_id = $2`,
                [sessionId, productId]
            );
        } else {
            const reservedResult = await client.query(
                `SELECT COALESCE(SUM(quantity), 0)::integer AS reserved
                FROM inventory_reservations
                WHERE product_id = $1
                    AND expires_at > NOW()`,
                    [productId]
            );

            const reserved = reservedResult.rows[0].reserved;
            const difference = quantity - existing.quantity;

            if (
                reserved + difference >
                productResult.rows[0].stock_quantity
            ) {
                throw new Error(
                    'Cannot add more items to your cart than are available'
                );
            }

            await client.query(
                `UPDATE inventory_reservations
                SET quantity = $1
                WHERE session_id = $2
                    AND product_id = $3
                    AND expires_at > NOW()`,
                [quantity, sessionId, productId]
            );
        }

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// remove product reservation from the cart
export const removeReservation = async (sessionId, productId) => {
    await pool.query(
        `DELETE FROM inventory_reservations
        WHERE session_id = $1
            AND product_id = $2`,
        [sessionId, productId]
    );
};

// remove all reservations from cart
export const clearReservations = async (sessionId) => {
    await pool.query(
        `DELETE FROM inventory_reservations
        WHERE session_id = $1`,
        [sessionId]
    );
};