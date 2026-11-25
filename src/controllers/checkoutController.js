
import * as orderModel from '../models/orderModel.js';
import * as reservationModel from '../models/reservationModel.js';
import * as cartModel from '../models/cartModel.js';
import { randomUUID } from 'node:crypto';

export const showCheckout = async (req, res, next) => {
    try {
        const items = await reservationModel.getCartItems(
            req.sessionID
        );

        // prevent checkout with empty cart
        if (items.length === 0) {
            return res.redirect('/cart');
        }

        // calculate total at checkout
        const total = cartModel.getCartTotal(items);

        // store a snapshot of customer's reviewed cart
        req.session.checkoutSnapshot = items.map(item => ({
            reservationId: String(item.reservationId),
            productId: item.id, 
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            expiresAt: new Date(item.expiresAt).toISOString()
        }));

        req.session.checkoutToken = randomUUID();

        res.render('checkout/checkout-index', {
            title: 'Checkout',
            items, 
            total,
            checkoutToken: req.session.checkoutToken
        });
    } catch (err) {
        console.error('Checkout page error:', err);
        next(err);
    }
};

export const placeOrder = async (req, res, next) => {
    try {
        const { checkoutToken } = req.body;
        
        if (
            typeof checkoutToken !== 'string' || 
            !req.session.checkoutToken ||
            checkoutToken !== req.session.checkoutToken ||
            !Array.isArray(req.session.checkoutSnapshot) ||
            req.session.checkoutSnapshot.length === 0 
        ) {
            return res.status(409).send(
                'Your checkout session has changed. Please review your cart and try again'
            );
        }
        const { fullName, address, city, state, zip } = req.body;

        // validate shipping info
        const fields = [fullName, address, city, state, zip];

        if (
            fields.some(value => 
                typeof value !== 'string' || !value.trim()
            ) ||
            fullName.trim().length > 100 ||
            address.trim().length > 255 ||
            city.trim().length > 100 ||
            state.trim().length > 100 ||
            zip.trim().length > 20
        ) {
            return res.status(400).send(
                'Please provide valid shipping information.'
            );
        }

        // save order and items in one transaction
        const orderId = await orderModel.createOrder(
            {
                userId: req.session.user.id,
                fullName: fullName.trim(),
                address: address.trim(),
                city: city.trim(),
                state: state.trim(),
                zip: zip.trim()
            },
            req.sessionID,
            req.session.checkoutSnapshot
        );

        //clear cart after order is saved
        return res.redirect(`/checkout/confirmation/${orderId}`);

    } catch (err) {
        // expected checkout  errors
        if (err instanceof orderModel.CheckoutError) {
            return res.status(409).send(err.message);
        }
        // unexpected server errors
        console.error('Checkout error:', err);
        next(err);
    }
};

// confirmation controller
export const showConfirmation = async (req, res, next) => {
    try {
        const orderId = Number(req.params.orderId);

        if (!Number.isInteger(orderId) || orderId < 1) {
            return res.status(404).send('Order not found');
        }

        const order = await orderModel.getOrderById(
            orderId, 
            req.session.user.id
        );

        if(!order) {
            return res.status(404).send('Order not found');
        }

        res.render('checkout/confirmation', {
            title: 'Order confirmation', 
            order
        });
    } catch (err) {
        console.error('Confirmation error:', err);
        next(err);
    }
};

export const showMyOrders = async (req, res, next) => {
    try {
        const userId = req.session.user.id;

        const orders = await orderModel.getOrderByUserId(userId);

        const orderWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await orderModel.getOrderItems(order.id);

                return {
                    ...order, 
                    items
                };
            })
        );

        res.render('checkout/my-orders', {
            title: 'My Orders', 
            orders: orderWithItems
        });
    } catch (err) {
        console.error('My orders error:', err);
        next(err);
    }
};