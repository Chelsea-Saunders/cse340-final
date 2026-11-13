import { Router } from 'express';
import {
    showAll, 
    showLeather, 
    showPhotography, 
    showPrints, 
    showItem,
} from '../controllers/shopController.js';

const router = Router();

router.get('/', showAll); 
router.get('/leather', showLeather); 
router.get('/photography', showPhotography); 
router.get('/screen-prints', showPrints); 
router.get('/item/:id', showItem); 

export default router;