import { Router } from 'express';

import {
    showRegister, 
    showLogin, 
    register,
    login,
    logout, 
    startGoogleLogin, 
    googleCallback
} from '../controllers/authControllers.js';

const router = Router();

// register page/form
router.get('/register', showRegister);
router.post('/register', register);

// login
router.get('/login', showLogin);
router.post('/login', login);

// google login
router.get('/google', startGoogleLogin);
router.get('/google/callback', googleCallback);

// logout
router.post('/logout', logout);

export default router;