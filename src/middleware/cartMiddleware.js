import * as cartModel from '../models/cartModel.js';
import * as reservationModel from '../models/reservationModel.js';

// make cart count accessable to ejs
export const addCartLocals = async (req, res, next) => {
    try {
        const items = await reservationModel.getCartItems(
            req.sessionID
        );
        res.locals.cartCount = cartModel.getCartItemCount(items);
        next();
    } catch (err) {
        next(err);
    }
};

// initialize session cart
export const initializeCart = (req, res, next) => {
    if (!req.session.cartInitialized) {
        req.session.cartInitialized = true;
    }
    next();
};

// validate product id
export const validateProductId = (req, res, next) => {
    const value = req.body?.productId;

    if (
        typeof value !== 'string' &&
        typeof value !== 'number' ||
        !/^\d+$/.test(String(value))
    ) {
        return res.status(400).json({
            message: 'Invalid product ID'
        });
    }

    const productId = Number(value);

    if (
        !Number.isSafeInteger(productId) ||
        productId < 1 || productId > 2147483647
    ) {
        return res.status(400).json({
            message: 'Invalid product ID'
        });
    }

    req.body.productId = productId;

    next();
};

// validate quantity
export const validateQuantity = (req, res, next) => {
    const value = req.body?.quantity;

    if (
        typeof value !== 'string' &&
        typeof value !== 'number' ||
        !/^\d+$/.test(String(value))
    ) {
        return res.status(400).json({
            message: 'Invalid quantity'
        });
    }

    const quantity = Number(value);

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
