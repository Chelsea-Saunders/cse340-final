import { Router } from 'express';
import { 
    showCart, 
    getCart, 
    addToCart, 
    updateCart, 
    removeFromCart,
    clearCart
} from '../controllers/cartController.js';
import {
    initializeCart, 
    validateProductId, 
    validateQuantity
} from '../middleware/cartMiddleware.js';

const router = Router();

router.use(initializeCart);

// display cart page
router.get('/', showCart);

// retrieve cart data
router.get('/data', getCart);

// cart operations
router.post(
    '/add', 
    validateProductId,
    validateQuantity,
    addToCart
);

router.post(
    '/update', 
    validateProductId, 
    validateQuantity,
    updateCart
);

router.post(
    '/remove',
    validateProductId, 
    removeFromCart
);

router.post('/clear', clearCart);

export default router;