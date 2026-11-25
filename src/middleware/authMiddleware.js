import pool from '../db/pgSQL.js';

export const requireLogin = (req, res, next) => {
    if (req.session?.user) {
        return next();
    }

    res.redirect('/auth/login');
};

export const requireAdmin = async (req, res, next) => {
    if (!req.session?.user) {
        return res.redirect('/auth/login');
    }

    try {
        const result = await pool.query(
            `SELECT role 
            FROM users 
            WHERE id = $1`, 
            [req.session.user.id]
        );

        const role = result.rows[0]?.role;

        if (role !== 'admin') {
            return res.status(403).send('Access denied');
        }

        req.session.user.role = role;

        return next();

    } catch (err) {
        return next(err);
    }
};

export const requireEmployee = async (req, res, next) => {
    if(!req.session?.user) {
        return res.redirect('/auth/login');
    }

    try {
        const result = await pool.query(
            `SELECT role 
            FROM users 
            WHERE id = $1`,
            [req.session.user.id]
        );

        const role = result.rows[0]?.role;

        if (role !== 'employee' && role !== 'admin') {
            return res.status(403).send('Access denied');
        }
        return next();
    } catch (err) {
        return next(err);
    }
};