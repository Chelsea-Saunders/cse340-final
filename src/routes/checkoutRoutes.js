import { Router } from 'express';
import { requireLogin } from '../middleware/authMiddleware.js';
import { 
    showCheckout,
    placeOrder,
    showConfirmation,
    showMyOrders
} from '../controllers/checkoutController.js';

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

router.post('/', requireLogin, placeOrder);

export default router;