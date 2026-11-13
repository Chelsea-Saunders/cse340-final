export const addLocalVariables = (req, res, next) => {
    res.locals.isLoggedIn = !!req.session?.user;
    next();
};