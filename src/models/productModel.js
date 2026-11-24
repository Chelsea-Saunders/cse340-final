import pool from '../db/pgSQL.js';

export const getAllProducts = async () => {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    return result.rows;
};

export const getProductById = async (id) => {
    const result = await pool.query(
        `SELECT p.*,
            GREATEST(
                p.stock_quantity - COALESCE(
                (
                    SELECT SUM(r.quantity)
                    FROM inventory_reservations r
                    WHERE r.product_id = p.id
                        AND r.expires_at > NOW()
                    ), 0
                ), 0
            )::integer AS available_quantity
        FROM products p
        WHERE p.id = $1`,
        [id]
    );

    return result.rows[0];
};

export const createProduct = async ({ 
    name, 
    category, 
    description, 
    price, 
    image_sm,
    image_med,
    image_lg ,
    stock_quantity
}) => {
    const result = await pool.query(
        `INSERT INTO products (
            name, 
            category, 
            description, 
            price, 
            image_sm,
            image_med,
            image_lg,
            stock_quantity
            )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`, 
        [
            name, 
            category, 
            description, 
            price, 
            image_sm,
            image_med,
            image_lg, 
            stock_quantity
        ]
    );
    return result.rows[0];
};

export const updateProduct = async (id, { 
    name, 
    category, 
    description, 
    price, 
    image_sm,
    image_med,
    image_lg,
    stock_quantity
}) => {
    const result = await pool.query(
        `UPDATE products
        SET name = $1, 
            category = $2, 
            description = $3, 
            price = $4, 
            image_sm = $5,
            image_med = $6,
            image_lg = $7,
            stock_quantity = $8
        WHERE id = $9
        RETURNING *`, 
        [
            name, 
            category, 
            description, 
            price, 
            image_sm,
            image_med,
            image_lg, 
            stock_quantity,
            id
        ]
    );


    console.log('Updated product rows:', result.rowCount);
    console.log('Update product:', result.rows[0]);


    return result.rows[0];
};

export const deleteProduct = async (id) => {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
};

export const getProductsByCategory = async (category) => {
    const sql = `SELECT * 
                FROM products 
                WHERE category = $1 
                ORDER BY id ASC`;
    const result = await pool.query(sql, [category]);
    return result.rows;
};