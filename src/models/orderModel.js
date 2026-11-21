import pool from '../db/pgSQL.js';

export const createOrder = async (order, items) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

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
                order.total
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
        `SELECT id, full_name, total, status, created_at
        FROM orders
        WHERE id = $1 AND user_id = $2`,
        [orderId, userId]
    );

    return result.rows[0] || null;
};