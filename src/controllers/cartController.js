
import * as cartModel from '../models/cartModel.js';
import * as productModel from '../models/productModel.js';

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
        const items = await cartModel.getCartItems(
            req.session.cart 
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
        const product = await productModel.getProductById(
            productId 
        );

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const existingItem = req.session.cart.find(
            item => Number(item.productId) === Number(productId)
        );

        const newQuantity = 
            (existingItem?.quantity || 0) + quantity;

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 || 
            newQuantity > 10
        ) {
            return res.status(400).json({
                message: 'Invalid cart quantity'
            });
        }

        if (newQuantity > product.stock_quantity) {
            return res.status(400).json({
                message: `Only  ${product.stock_quantity} available in stock`
            });
        }

        req.session.cart = cartModel.addToCart(
            req.session.cart, 
            productId,
            quantity
        );

        return getCart(req, res, next);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// update quantity 
export const updateCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;

        // check quantity before updateing
        if (
            !Number.isInteger(quantity) ||
            quantity < 0 ||
            quantity > 10
        ) {
            return res.status(400).json({
                message: 'Invalid cart quantity'
            });
        }

        // current inventory count
        const product = await productModel.getProductById(productId);

        if (!product) {
            return res.status(400).json({
                message: 'Product not found'
            });
        }

        if (quantity > product.stock_quantity) {
            return res.status(400).json({
                message: `Only ${product.stock_quantity} available in stock`
            });
        }

        req.session.cart = cartModel.updateQuantity(
            req.session.cart, 
            productId, 
            quantity
        );

        return getCart(req, res, next);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// remove product from cart
export const removeFromCart = (req, res, next) => {
    try {
        const { productId } = req.body;

        req.session.cart = cartModel.removeFromCart(
            req.session.cart, 
            productId
        );

        return getCart(req, res, next);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

// clear cart
export const clearCart = (req, res, next) => {
    try {
        req.session.cart = cartModel.clearCart();

        return getCart(req, res, next);
    } catch (err){
        console.log(err);
        next(err);
    }
};