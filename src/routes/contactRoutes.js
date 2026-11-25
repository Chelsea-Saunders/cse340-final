import { Router } from 'express';
import {
    showContact, 
    submitContact
} from '../controllers/contactController.js';

import {
    validateContactSubmission
} from '../middleware/contactMiddleware.js';

const router = Router();

router.get('/', showContact);
router.post(
    '/', 
    validateContactSubmission,
    submitContact);

export default router; 