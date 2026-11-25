
import { Router } from 'express';

import aboutRoutes from './aboutRoutes.js';
import shopRoutes from './shopRoutes.js';
import authRoutes from './authRoutes.js';
import cartRoutes from './cartRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import contactRoutes from './contactRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

// homepage
router.get('/', (req, res) => {
    res.render('home/index', {
         title: 'Home' 
    });
});

// public routes
router.use('/about', aboutRoutes);
router.use('/shop', shopRoutes);
router.use('/contact', contactRoutes);

// authentication
router.use('/auth', authRoutes); 

// cart and checkout
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);

//dashboard
router.use('/dashboard', dashboardRoutes);

export default router;
