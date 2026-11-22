import * as cartModel from '../models/cartModel.js';
import * as orderModel from '../models/orderModel.js';

export const placeOrder = async (req, res, next) => {
    try {
        const { fullName, address, city, state, zip } = req.body;

        // validate shipping info
        const fields = [fullName, address, city, state, zip];

        if (
            fields.some(value => 
                typeof value !== 'string' || !value.trim()
            ) ||
            fullName.trim().length > 100 ||
            address.trim().length > 255 |
            city.trim().length > 100 ||
            state.trim().length > 100 ||
            zip.trim().length > 20
        ) {
            return res.status(400).send(
                'Please provide valid shipping information.'
            );
        }

        // read cart from session
        const sessionCart = req.session.cart;

        if (!Array.isArray(sessionCart) || sessionCart.length === 0) {
            return res.status(400).send(
                'Your cart is empty'
            );
        }

        // validate every cart entry before saving an order
        const validCart = sessionCart.every(item => 
            Number.isInteger(item.productId) &&
            item.productId > 0 &&
            Number.isInteger(item.quantity) && 
            item.quantity >= 1 &&
            item.quantity <= 10
        );

        if (!validCart) {
            return res.status(400).send(
                'Your cart contains an invalid item'
            );
        }

        // get current product from PostgreSQL
        const items = await cartModel.getCartItems(sessionCart);

        if (items.length !== sessionCart.length) {
            return res.status(400).send(
                'A product in your cart is no longer available'
            );
        }

        const total = cartModel.getCartTotal(items);

        if (!Number.isFinite(total) || total < 0) {
            return res.status(400).send(
                'Unable to calculate your order total'
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
                zip: zip.trim(),
                total
            },
            items
        );

        //clear cart after order is saved
        req.session.cart = [];

        req.session.save(err => {
            if (err) return next(err);

            res.redirect(`/checkout/confirmation/${orderId}`);
        });
    } catch (err) {
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
        console.error('My orders errof:', err);
        next(err);
    }
};