import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel.js';
import * as oidc from 'openid-client';

import { getGoogleConfig } from '../config/googleAuth.js';
import { 
    getUserByGoogleId, 
    createGoogleUser
} from '../models/userModel.js';

export const showRegister = async (req, res, next) => {
    try {
        res.render('auth/register', { 
            title: 'Register', 
            errors: [],
            formData: {} 
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const showLogin = async (req, res, next) => {
    try {
        res.render('auth/login', { 
            title: 'Login'
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const register = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        const cleanName = typeof name === 'string' ? name.trim() : '';
        const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        const errors = [];
        const formData = {
            name: cleanName, 
            email: cleanEmail
        };

        //validate name
        if (!cleanName || cleanName.length > 100) {
            errors.push({
                message: 'name is required and must be less than 100 characters.'
            });
        }

        // validate email
        if (
            !cleanEmail || cleanEmail.length > 255 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            errors.push({
                message: 'Please enter a valid email address'
            });
        }

        // validate password
        if (
            typeof password !== 'string' ||
            password.length < 15 ||
            Buffer.byteLength(password, 'utf8') > 72
        ) {
            errors.push({
                message: 'Password must be at least 15 characters and no more than 72'
            });
        }

        // confirm password match 
        if (password !== confirmPassword) {
            errors.push({
                message: 'Passwords do not match'
            });
        }
        // return validation errors
        if(errors.length > 0) {
            return res.status(400).render('auth/register', {
                title: 'Register', 
                errors,
                formData
            });
        }

        // check for existing acct
        const existingUser = await userModel.getUserByEmail(cleanEmail);

        if(existingUser) {
            return res.status(409).render('auth/register', {
                title: 'Register', 
                errors: [{ message: 'An account with this email already exists.' }], 
                formData
            });
        }

        // hash password before storing
        const passwordHash = await bcrypt.hash(password, 12);

        // create user in postgreSQL
        await userModel.createUser(
            cleanName, 
            cleanEmail,
            passwordHash
        );

        // success message
        return res.redirect('/auth/login');
    } catch (err) {
        // handle duplicate email attempts
        if (err.code === '23505') {
            return res.status(409).render('auth/register', {
                title: 'Register',
                errors: [{ message: 'An account with this email already exists.' }],
                formData: {
                    name: typeof req.body.name === 'string'
                        ? req.body.name.trim()
                        : '',
                    email: typeof req.body.email === 'string'
                        ? req.body.email.trim().toLowerCase()
                        : ''
                }
            });
        }

        return next(err);
    }
};

// login
export const login = async (req, res, next) => {

    console.log('LOGIN POST CONTROLLER REACHED');
    try {
        const { email, password } = req.body;

        const cleanEmail = typeof email === 'string'
            ? email.trim().toLocaleLowerCase()
            : '';

        if (!cleanEmail || typeof password !== 'string') {
            return res.status(400).render('auth/login', {
                title: 'Login', 
                error: 'Please enter your email and password'
            });
        }

        const user = await userModel.getUserByEmail(cleanEmail);

        const passwordMatches = user 
            ? await bcrypt.compare(password, user.password_hash)
            : false;
        
        if (!user || !passwordMatches) {
            return res.status(401).render('auth/login', {
                title: 'Login', 
                error: 'Invalid email or password'
            });
        }

        // presserve guest shopping cart
        const guestCart = req.session.cart;

        // fresh session after authentication
        req.session.regenerate((err) => {
            if (err) return next(err);

            req.session.user = {
                id: user.id, 
                name: user.name,
                email: user.email,
                role: user.role
            };

            console.log('Login session user ID:', req.session.user.id);

            if (guestCart) {
                req.session.cart = guestCart;
            }

            req.session.save((err) => {
                if (err) return next(err);

                return res.redirect('/shop');
            });
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const logout = async (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }

        res.clearCookie('connect.sid');

        return res.redirect('/');
    });
};

// GOOGLE LOGIN
export const startGoogleLogin = async (req, res, next) => {
    try {
        const config = await getGoogleConfig();
        const verifier = oidc.randomPKCECodeVerifier();
        const challenge = await oidc.calculatePKCECodeChallenge(verifier);

        const state = oidc.randomState();
        const nonce = oidc.randomNonce();

        // save cart while loggin in
        req.session.googleAuth = {
            verifier, 
            state, 
            nonce
        };

        const authorizatonUrl = oidc.buildAuthorizationUrl(config, {
            redirect_uri: process.env.GOOGLE_CALLBACK_URL, 
            scope: 'openid email profile', 
            code_challenge: challenge, 
            code_challenge_method: 'S256',
            state, nonce
        });

        req.session.save((err) => {
            if (err) return next(err);

            return res.redirect(authorizatonUrl.href);
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const googleCallback = async (req, res, next) => {
    try {
        const auth = req.session.googleAuth;

        if(!auth) {
            return res.status(400).send(
                'Google login session expired. Please try again.'
            );
        }

        // make oauth transaction single-use
        delete req.session.googleAuth;

        const config = await getGoogleConfig();

        const callbackUrl = new URL (
            req.originalUrl, 
            process.env.GOOGLE_CALLBACK_URL
        );

        const tokens = await oidc.authorizationCodeGrant(
            config, 
            callbackUrl,
            {
                pkceCodeVerifier: auth.verifier,
                expectedState: auth.state, 
                expectedNonce: auth.nonce,
                idTokenExpected: true
            }
        );

        const claims = tokens.claims();

        if (
            !claims?.sub ||
            !claims.email ||
            claims.email_verified !== true
        ) {
            return res.status(403).send(
                'Google did not provide a verified email address.'
            );
        }

        const googleId = claims.sub;
        const email = claims.email.trim().toLowerCase();
        const name = (claims.name || email).slice(0, 100);

        let user = await getUserByGoogleId(googleId);

        if (!user) {
            try{
                user = await createGoogleUser(
                    name, 
                    email, 
                    googleId
                );
            } catch (err) {
                if (err.code === '23505') {
                    return res.status(409).send(
                        'An account with this email alread exists.' +
                        'Please sign in using your existing method.'
                    );
                }

                throw err;
            }
        }

        // presserve guest shopping cart
        const guestCart = req.session.cart;

        // fresh session after authentication
        req.session.regenerate((err) => {
            if (err) return next(err);

            req.session.user = {
                id: user.id, 
                name: user.name,
                email: user.email,
                role: user.role
            };

            if (guestCart) {
                req.session.cart = guestCart;
            }

            req.session.save((err) => {
                if (err) return next(err);

                return res.redirect('/shop');
            });
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

// refresh token (POST /auth/refresh)

// get current usser / me (GET /auth/me)

// get user by id (GET /auth/users/:id)

// forgot password (POST /auth/forgot-password)

// reset password (POST /auth/reset-password)

// verify email /resend verification

// change password

// oauth callback / google login