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
        RETURNING id, name, email, role`,
        [name, email, googleId]
    );
    return result.rows[0];
};

export const getUserProfile = async (userId) => {

    const result = await pool.query(
        `SELECT 
            id, 
            name, 
            email,
            (password_hash IS NOT NULL) AS has_password
        FROM users
        WHERE id = $1`,
        [userId]
    );

    return result.rows[0];
};

export const updateUserName = async (userId, name) => {
    const result = await pool.query(
            `UPDATE users
            SET name = $1
            WHERE id = $2
            RETURNING id, name, email`,
            [name, userId]
        );

        return result.rows[0];
};

export const getUserPassword = async (userId) => {
    const result = await pool.query(
            `SELECT password_hash
            FROM users
            WHERE id = $1`,
            [userId]
        );

        return result.rows[0];
}

export const updateUserPassword = async (userId, newHash) => {
    const result = await pool.query(
            `UPDATE users
            SET password_hash = $1
            WHERE id = $2`,
            [newHash, userId]
        );

        return result.rowCount === 1;
}

export const getUserByRole = async (role) => {
    const result = await pool.query(
            `SELECT id, name, email, role
            FROM users
            WHERE role = $1
            ORDER BY name`,
            [role]
        );

    return result.rows;
}

export const updateUserRole = async (
    userId, 
    newRole, 
    currentRole
) => {
    const result = await pool.query(
        `UPDATE users
        SET role = $1
        WHERE id = $2 
            AND role = $3
        RETURNING id`,
        [newRole, userId, currentRole]
    );
    return result.rowCount === 1;
}

export const getUserRole = async (userId) => {
    const result = await pool.query(
            `SELECT role 
            FROM users 
            WHERE id = $1`, 
            [userId]
        );

        return result.rows[0]?.role || null;
}