import pool from '../db/pgSQL.js';

// find user by email
export const getUserByEmail = async (email) => {
    const query = `
    SELECT id, name, email, password_hash, role
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
};

// create new user
export const createUser = async (name, email, passwordHash) => {
    const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, role
    `;

    const result = await pool.query(query, [
        name, 
        email, 
        passwordHash
    ]);

    return result.rows[0];
};

export const getUserByGoogleId = async (googleId) => {
    const result = await pool.query(
        `SELECT id, name, email, role
        FROM users
        WHERE google_id = $1
        LIMIT 1`,
        [googleId]
    );

    return result.rows [0] || null;
};

export const createGoogleUser = async (name, email, googleId) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, google_id)
        VALUES ($1, $2, $3)
        RETURNING id, name email, role`,
        [name, email, googleId]
    );
    return result.rows[0];
};