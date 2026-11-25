import { Router } from 'express';
import { requireLogin } from '../middleware/authMiddleware.js';
import { 
    showCheckout,
    placeOrder,
    showConfirmation,
    showMyOrders
} from '../controllers/checkoutController.js';

// import { validateId } from '../middleware/validateMiddleware.js';

const router = Router();

// GET checkout route
router.get('/', requireLogin, showCheckout);

// orders page
router.get('/orders', requireLogin, showMyOrders);
// order confirmation
router.get(
    '/confirmation/:orderId',
    requireLogin,
    showConfirmation
);

// router.get(
//     '/confimration/:orderId',
//     validateId('params', 'orderId'),
//     showConfirmation
// );

router.post('/', requireLogin, placeOrder);

export default router;