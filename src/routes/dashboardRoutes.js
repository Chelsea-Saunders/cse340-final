
import { Router } from 'express';
import { uploadProductImage } from '../middleware/uploadMiddleware.js';
import {
    showProfile,
    updateProfile,
    showSecurity,
    updatePassword,
    showDashboard, 
    showAddForm, 
    addProduct, 
    showEditForm, 
    editProduct, 
    removeProduct,
    showEmployeeDashboard,
    showAdminDashboard
} from '../controllers/dashboardController.js';

import { 
    requireLogin,
    requireEmployee,
    requireAdmin 
} from '../middleware/authMiddleware.js';
const router = Router();

router.use(requireLogin);

// anyone logged in can access their dashboard
router.get('/', showDashboard);

router.get('/profile', showProfile);
router.post('/profile', updateProfile);

router.get('/security', showSecurity);
router.post('/security', updatePassword);

// employee dashboard
router.get('/employee', requireEmployee, showEmployeeDashboard);

// admin dashboard
router.get('/admin', requireAdmin, showAdminDashboard);

// ONLY ADMIN can manage products
router.get('/add', requireAdmin, showAddForm);
router.post('/add', requireAdmin, uploadProductImage, addProduct);

router.get('/edit/:id', requireAdmin, showEditForm);
router.post('/edit/:id', requireAdmin, uploadProductImage, editProduct);

router.post('/delete/:id', requireAdmin, removeProduct);

export default router;