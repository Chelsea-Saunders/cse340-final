export const requireLogin = (req, res, next) => {
    if (req.session?.user) {
        return next();
    }

    res.redirect('/auth/login');
};

export const requireAdmin = (req, res, next) => {
    if (!req.session?.user) {
        return res.redirect('/auth/login');
    }

    if (req.session.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied'
        });
    }
    return next();
}