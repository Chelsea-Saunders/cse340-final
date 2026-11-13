
import { Router } from 'express';
import {
    showDashboard, 
    showAddForm, 
    addProduct, 
    showEditForm, 
    editProduct, 
    removeProduct
} from '../controllers/dashboardController.js';


import { requireLogin } from '../middleware/auth.js';
const router = Router();

router.use(requireLogin);

router.get('/', showDashboard);
router.get('/add', showAddForm);
router.post('/add', addProduct);
router.get('/edit/:id', showEditForm);
router.post('/edit/:id', editProduct);
router.post('/delete/:id', removeProduct);

export default router;