import { Router } from 'express';

import {
    showRegister, 
    showLogin, 
    register,
    login,
    logout, 
    startGoogleLogin, 
    googleCallback
    // refreshToken,
    // currentUser,
    // getUserById,
    // forgotPassword,
    // resetPassword, 
    // verifyEmail,
    // resendVerification,
    // changePassword
} from '../controllers/authControllers.js';

// import {

// } from '../middleware/authMiddleware.js';

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

// // logout
// router.get('/logout', logout);

// // refresh
// router.get('/auth/refresh', refreshToken);

// // current user
// router.get('/user', currentUser);

// // get user by id
// router.get('/user/:id', getUserById);

// // forgot password
// router.get('/auth/forgotPassword', forgotPassord);

// // reset password
// router.get('/auth/reset', resetPassword);

// // verify email
// router.get('/auth/verifyEmail', verifyEmail);

// // resend verification
// router.get('/auth/resendVerification', resendverification);

// // change password
// router.get('/auth/changePassword', changePassword);

export default router;