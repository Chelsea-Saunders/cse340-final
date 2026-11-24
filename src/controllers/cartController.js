
import * as cartModel from '../models/cartModel.js';
import * as reservationModel from '../models/reservationModel.js';

// display cart page
export const showCart = async (req, res, next) => {
    try {
        res.render('cart/cart-index', {
            title: 'Your Cart'
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

// return cart data
export const getCart = async (req, res, next) => {
    try {
        const items = await reservationModel.getCartItems(
            req.sessionID
        );

        res.json({
            items, 
            count: cartModel.getCartItemCount(items),
            total: cartModel.getCartTotal(items)
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

// add product 
export const addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        await reservationModel.reserveProduct(
            req.sessionID,
            productId,
            quantity
        );
        return getCart(req, res, next);

    } catch (err) {
        console.log(err);

        if ([
            'Invalid product or quantity', 
            'Invalid cart quantity',
            'Product not found',
            'Cannot add more items to your cart than are available'
        ].includes(err.message)) {
            return res.status(400).json({
                message: err.message
            });
        }
        next(err);
    }
};

// update quantity 
export const updateCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        await reservationModel.updateReservationQuantity(
            req.sessionID,
            productId, 
            quantity
        );

        return getCart(req, res, next);

    } catch (err) {
        console.log(err);

        if ([
            'Invalid product or quantity',
            'Product not found', 
            'Reservation expired or not found',
            'Cannot add more items to your cart than are available.'
        ].includes(err.message)) {
            return res.status(400).json({
                message: err.message
            });
        }
        next(err);
    }
};

// remove product from cart
export const removeFromCart = async(req, res, next) => {
    try {
        const { productId } = req.body;

       await reservationModel.removeReservation(
            req.sessionID, 
            productId
        );

        return getCart(req, res, next);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// clear cart
export const clearCart = async (req, res, next) => {
    try {
        await reservationModel.clearReservations(
            req.sessionID
        );

        return getCart(req, res, next);
    } catch (err){
        console.log(err);
        next(err);
    }
};