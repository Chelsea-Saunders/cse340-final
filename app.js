
import express from'express';
import { fileURLToPath } from 'url'
import path from 'path';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './src/db/pgSQL.js';

import routesIndex from './src/routes/routes-index.js';
import routesAbout from './src/routes/aboutRoutes.js';
import routesDashboard from './src/routes/dashboardRoutes.js';
import routesShop from './src/routes/shopRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import checkoutRoutes from './src/routes/checkoutRoutes.js';
import { addCartLocals } from './src/middleware/cartMiddleware.js';
import { addLocalVariables } from './src/middleware/global.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'production';

const app = express();
const PgSession = connectPgSimple(session);

// CONFIG EXPRESS
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// BODY PARSING
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    store: new PgSession({
        pool: pool,
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// GLOBAL MIDDLEWARE
app.use(addLocalVariables);
app.use(addCartLocals);
app.use((req, res, next) => {
    res.locals.isLoggedIn = Boolean(req.session?.user);
    res.locals.isAdmin = req.session?.user?.role === 'admin';
    res.locals.currentUser = req.session?.user || null;
    res.locals.NODE_ENV = NODE_ENV;
    res.locals.currentYear = new Date().getFullYear();

    console.log('Session user:', req.session?.user);
    console.log('logged in:', res.locals.isLoggedIn);

    next();
});

// ROUTER
app.use('/', routesIndex);
app.use('/shop', routesShop);
app.use('/about', routesAbout);
app.use('/dashboard', routesDashboard);
app.use('/cart', cartRoutes);
app.use('/auth', authRoutes);
app.use('/checkout', checkoutRoutes);

// 404's
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// GLOBAL ERROR HANDLING
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    const status = err.status || 500;
    console.error(`${status} on ${req.method} ${req.originalUrl}:, ${err.message}`);
    if (status === 500) console.error(err.stack);

    const template = status === 404 ? '404' : '500';

    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error', 
        error: NODE_ENV === 'production' ? 'An error occured' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack, NODE_ENV,
    };

    res.status(status).render(`errors/${template}`, context); 
});

export default app;