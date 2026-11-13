import { Router } from 'express';
import { showAbout } from '../controllers/aboutController.js';

const router = Router();

router.get('/', showAbout);

export default router; 