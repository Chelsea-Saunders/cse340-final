// import express from 'express';
import { Router } from 'express';

import * as dashboardController 
    from '../controllers/dashboardController.js';

import { 
    requireLogin,
    requireEmployee,
    requireAdmin
} from '../middleware/authMiddleware.js';

import {
    validateProfileName, 
    validatePasswordChange
} from '../middleware/userMiddleware.js';

import { validateId } from '../middleware/validateMiddleware.js';

import { validateContactResponse } from '../middleware/contactMiddleware.js';

import {
    validateStockQuantity,
    requireProductImage
} from '../middleware/productMiddleware.js';

import { uploadProductImage } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(requireLogin);

// general dashboard
router.get('/', dashboardController.showDashboard);

// user profile
router.get(
    '/profile', 
    dashboardController.showProfile
);

router.post(
    '/profile', 
    validateProfileName,
    dashboardController.updateProfile
);

router.get(
    '/messages', 
    dashboardController.showMyMessages
);

// account security
router.get(
    '/security', 
    dashboardController.showSecurity
);

router.post(
    '/security', 
    validatePasswordChange,
    dashboardController.updatePassword
);

// employee dashboard
router.get(
    '/employee', 
    requireEmployee, 
    dashboardController.showEmployeeDashboard
);

// contact message route
router.get(
    '/contact-messages', 
    requireEmployee, 
    dashboardController.showContactMessages
);

router.post(
    '/contact-messages/:id/respond', 
    requireEmployee, 
    validateId('params', 'id'),
    validateContactResponse,
    dashboardController.respondToContactMessage
);

// admin dashboard
router.get(
    '/admin', 
    requireAdmin, 
    dashboardController.showAdminDashboard
);

// admin employee management
router.get(
    '/employees', 
    requireAdmin, 
    dashboardController.showManageEmployees
);

router.post(
    '/employees/add', 
    requireAdmin, 
    validateId('body', 'userId'),
    dashboardController.addEmployee
);

router.post(
    '/employees/remove/:id', 
    requireAdmin, 
    validateId('params', 'id'),
    dashboardController.removeEmployee
);

// product management
router.get(
    '/products', 
    requireAdmin, 
    dashboardController.showManageProducts
);

router.get(
    '/add', 
    requireAdmin, 
    dashboardController.showAddForm
);
router.post(
    '/add', 
    requireAdmin, 
    uploadProductImage,
    validateStockQuantity,
    requireProductImage, 
    dashboardController.addProduct
);

router.get(
    '/edit/:id', 
    requireAdmin, 
    validateId('params', 'id'),
    dashboardController.showEditForm
);

router.post(
    '/edit/:id', 
    requireAdmin, 
    validateId('params', 'id'),
    uploadProductImage, 
    validateStockQuantity,
    dashboardController.editProduct
);

router.post(
    '/delete/:id', 
    requireAdmin, 
    validateId('params', 'id'),
    dashboardController.removeProduct
);

export default router;