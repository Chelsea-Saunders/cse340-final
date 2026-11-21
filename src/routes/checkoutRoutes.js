import { Router } from 'express';
import { requireLogin } from '../middleware/authMiddleware.js';
import { 
    placeOrder,
    showConfirmation 
} from '../controllers/checkoutController.js';

const router = Router();

router.get('/', requireLogin, (req, res) => {
    res.render('checkout/checkout-index', {
        title:'Checkout'
    });
});
router.get(
    '/confirmation/:orderId',
    requireLogin,
    showConfirmation
);
router.post('/', requireLogin, placeOrder);

export default router;