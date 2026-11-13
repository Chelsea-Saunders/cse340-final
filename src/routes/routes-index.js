import express from 'express';
import { Router } from 'express';

// import homeRoutes from './homeRoutes.js';
import aboutRoutes from './aboutRoutes.js';
import shopRoutes from './shopRoutes.js';
// import contactRoutes from './contactRoutes.js';
// import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
// import adminRoutes from './adminRoutes.js';
// import employeeRoutes from './employeeRoutes.js';

const router = Router();

router.get('/', (req, res) => {
    res.render('home/index', { title: 'Home' });
});

// router.use('/', homeRoutes);
router.use('/about', aboutRoutes);
router.use('/shop', shopRoutes);
// router.use('/contact', contactRoutes);
// router.use('/', authRoutes); // root level so URLs stay /login, /register, /logout
router.use('/dashboard', dashboardRoutes);
// router.use('/admin', adminRoutes);
// router.use('/employee', employeeRoutes);

export default router;
