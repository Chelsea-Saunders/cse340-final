import { Router } from 'express';
import { requireLogin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireLogin, (req, res) => {
    res.render('checkout/checkout-index', {
        title:'Checkout'
    });
});

export default router;