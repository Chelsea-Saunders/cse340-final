
import { Router } from 'express';
import { uploadProductImage } from '../middleware/uploadMiddleware.js';
import {
    showProfile,
    updateProfile,
    showSecurity,
    updatePassword,
    showDashboard, 
    showManageProducts,
    showAddForm, 
    addProduct, 
    showEditForm, 
    editProduct, 
    removeProduct,
    showEmployeeDashboard,
    showAdminDashboard,
    showManageEmployees,
    addEmployee, 
    removeEmployee,
    showContactMessages,
    respondToContactMessage,
    showMyMessages
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
router.get('/messages', showMyMessages);
router.post('/profile', updateProfile);

router.get('/security', showSecurity);
router.post('/security', updatePassword);

// employee dashboard
router.get('/employee', requireEmployee, showEmployeeDashboard);
router.get('/contact-messages', requireEmployee, showContactMessages);
router.post('/contact-messages/:id/respond', requireEmployee, respondToContactMessage);

// admin dashboard
router.get('/admin', requireAdmin, showAdminDashboard);

// admin employee management
router.get('/employees', requireAdmin, showManageEmployees);
router.post('/employees/add', requireAdmin, addEmployee);
router.post('/employees/remove/:id', requireAdmin, removeEmployee);

// ONLY ADMIN can manage products
router.get('/products', requireAdmin, showManageProducts);
router.get('/add', requireAdmin, showAddForm);
router.post('/add', requireAdmin, uploadProductImage, addProduct);

router.get('/edit/:id', requireAdmin, showEditForm);
router.post('/edit/:id', requireAdmin, uploadProductImage, editProduct);

router.post('/delete/:id', requireAdmin, removeProduct);

export default router;