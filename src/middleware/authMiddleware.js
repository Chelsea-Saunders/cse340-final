import * as userModel from '../models/userModel.js';

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
        const role = await userModel.getUserRole(
            req.session.user.id
        );

        if (!role) {
            return res.status(403).send('Access denied');
        }

        if (role !== 'admin') {
            return res.status(403).send('Access denied');
        }

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
        const role = await userModel.getUserRole (
            req.session.user.id
        );

        if (!role) {
            return res.status(403).send('Access denied');
        }

        req.session.user.role = role;

        if (role !== 'employee' && role !== 'admin') {
            return res.status(403).send('Access denied');
        }
        return next();
    } catch (err) {
        return next(err);
    }
};