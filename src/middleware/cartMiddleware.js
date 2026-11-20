import * as cartModel from '../models/cartModel.js';

// make cart count accessable to ejs
export const addCartLocals = (req, res, next) => {
    res.locals.cartCount = cartModel.getCartItemCount(
        req.session.cart || []
    );

    next();
};

// initialize session cart
export const initializeCart = (req, res, next) => {
    if (!Array.isArray(req.session.cart)) {
        req.session.cart = [];
    }
    next();
};

// validate product id
export const validateProductId = (req, res, next) => {
    const productId = Number(req.body.productId);

    if (!Number.isInteger(productId) ||
        productId < 1 ||
        productId > 2147483647) {
        return res.status(400).json({
            message: 'Invalid product Id'
        });
    }

    req.body.productId = productId;

    next();
};

// validate quantity
export const validateQuantity = (req, res, next) => {
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity) ||
        quantity < 0 ||
        quantity > 10) {
        return res.status(400).json({
            message: 'Invalid quantity'
        });
    }
    req.body.quantity = quantity;

    next();
};
