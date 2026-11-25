import pool from '../db/pgSQL.js';

export const getAllContactMessages = async () => {
    const result = await pool.query(`
        SELECT *
        FROM contact_messages
        ORDER BY created_at DESC
    `);
    return result.rows;
}

export const respondToMessage = async (
    messageId, 
    response, 
    respondedBy
) => {
    const result = await pool.query(`
        UPDATE contact_messages
        SET response = $1,
            responded_by = $2,
            responded_at = NOW(),
            status = 'responded'
        WHERE id = $3
            AND status = 'pending'
        RETURNING id
    `, [
        response,
        respondedBy,
        messageId
    ]);
    return result.rowCount === 1;
}

export const getContactMessagesByUserId = async (userId) => {
    const result = await pool.query(`
        SELECT id, subject, message, status,
            response, created_at, responded_at
        FROM contact_messages
        WHERE user_id = $1
        ORDER BY created_at DESC
        `, [userId]);

    return result.rows;
};

export const createContactMessage = async ({
    userId, 
    name,
    email,
    subject,
    message
}) => {
    const result = await pool.query(
        `INSERT INTO contact_messages
        (user_id, name, email, subject, message)
        VALUES ($1, $2, $3, $4, $5)`,
        [userId, name, email, subject, message]
    );

    return result.rowCount === 1;
};