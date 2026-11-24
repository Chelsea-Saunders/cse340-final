import { Router } from 'express';
import {
    showAll, 
    showLeather, 
    showPhotography, 
    showPrints, 
    showItem,
    getProductAvailability
} from '../controllers/shopController.js';

const router = Router();

router.get('/', showAll); 
router.get('/leather', showLeather); 
router.get('/photography', showPhotography); 
router.get('/screen-prints', showPrints); 
router.get('/item/:id', showItem); 

// current available inventory
router.get('/item/:id/availability', getProductAvailability);

export default router;