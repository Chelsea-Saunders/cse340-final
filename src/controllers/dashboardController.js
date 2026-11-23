import pool from '../db/pgSQL.js';
import bcrypt from 'bcrypt';

import {
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct
} from '../models/productModel.js';

function parseStockQuantity(value) {
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
        return null;
    }

    const quantity = Number(value);

    if (!Number.isSafeInteger(quantity) || quantity < 0) {
        return null;
    }

    return quantity;
}

export const showDashboard = async (req, res, next) => {
    const user = req.session.user;

    if (user.role === 'admin') {
        return res.redirect('/dashboard/admin');
    }

    if (user.role === 'employee') {
        return res.redirect('/dashboard/employee');
    }

    return res.render('dashboard/dashboard-index', { 
        title: 'My Account', 
        user
    });
};

export const showAddForm = (req, res) => {
    res.render('dashboard/edit', { title: 'Add Product', product: null });
};

export const addProduct = async (req, res, next) => {
    try {
        if(!req.file) {
            return res.status(400).send('Please upload a product image');
        }

        const stockQuantity = parseStockQuantity(req.body.stock_quantity);

        if (stockQuantity === null) {
            return res.status(400).send(
                'Quantity available must be a non-negative whole number'
            );
        }

        const imagePath = `/uploads/products/${req.file.filename}`;

        await createProduct({
            ...req.body,
            stock_quantity: stockQuantity,
            image_sm: imagePath,
            image_med: imagePath,
            image_lg: imagePath
        });

        res.redirect('/dashboard/products');
    }catch (err) {
        console.error(err);
        next(err);
    }
};

export const showEditForm = async (req, res, next) => {
    try {
        const product = await getProductById(req.params.id);

        console.log('Product loaded for edit:', {
            id: product?.id,
            name: product?.name,
            stock_quantity: product?.stock_quantity
        });

        if (!product) {
            const err = new Error('Product not found');
            err.status = 404;
            return next(err);
        }
        res.render('dashboard/edit', { title: 'Edit Product', product });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const editProduct = async (req, res, next) => {
    try {
        const stockQuantity = parseStockQuantity(req.body.stock_quantity);
        const existingProduct = await getProductById(req.params.id);

        if(!existingProduct) {
            return res.status(404).send('Product not found');
        }

        if(stockQuantity === null) {
            return res.status(400).send(
                'Quantity availbale must be a non-negative whole number'
            );
        }

        const imagePath = req.file
            ?`/uploads/products/${req.file.filename}`
            : null;

        await updateProduct(req.params.id, {
            ...req.body,
            stock_quantity: stockQuantity,
            image_sm: imagePath || existingProduct.image_sm,
            image_med: imagePath || existingProduct.image_med,
            image_lg: imagePath || existingProduct.image_lg
        });

        res.redirect('/dashboard/products');
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const removeProduct = async (req, res, next) => {
    try {
        await deleteProduct(req.params.id);
        res.redirect('/dashboard/products');
    } catch (err) {
        console.error(err);
        next(err);
    }
};

// manage products page
export const showManageProducts = async (req, res, next) => {
    try {
        const products = await getAllProducts();

        res.render('dashboard/products', {
            title: 'Manage Products',
            user: req.session.user, 
            products
        });
    } catch (err) {
        console.error('Unable to load products:', err);
        next (err);
    }
};

export const showProfile = async (req, res, next) => {
    try {
        const userId = req.session.user.id;

        const result = await pool.query(
            `SELECT id, name, email
            FROM users
            WHERE id = $1`,
            [userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('dashboard/profile', {
            title: 'My profile',
            user,
            updated: req.query.updated === '1'
        });
    }catch (err) {
        console.log(err);
        next(err);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const name = req.body.name?.trim();

        if (!name || name.length > 100) {
            return res.status(400).send(
                'Name must be between 1 and 100 characters'
            );
        }

        const result = await pool.query(
            `UPDATE users
            SET name = $1
            WHERE id = $2
            RETURNING id, name, email`,
            [name, userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).send('User not found');
        }

        // sync session name w/database
        req.session.user.name = user.name;

        req.session.save((err) => {
            if (err) {
                return next(err);
            }

            res.redirect('/dashboard/profile?updated=1');
        });
    }catch (err) {
        console.log(err);
        next(err);
    }
};

export const showSecurity = async (req, res, next) => {
    try {
        const userId = req.session.user.id;

        const result = await pool.query(
            `SELECT password_hash
            FROM users
            WHERE id = $1`,
            [userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('dashboard/security', {
            title: 'Account Security',
            hasPassword: Boolean(user.password_hash),
            updated: req.query.updated === '1',
            error: null
        });
    }catch (err) {
        console.log(err);
        next(err);
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        const userId = req. session.user.id;
        const {currentPassword, newPassword, confirmPassword } = req.body;
        
        const result = await pool.query(
            `SELECT password_hash
            FROM users
            WHERE id = $1`,
            [userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).send('User not found');
        }

        // google accounts that dont have local password
        if (!user.password_hash) {
            return res.status(403).send(
                'Password changes are unavailable for this account'
            );
        }

        if (
            typeof currentPassword !== 'string' ||
            typeof newPassword !== 'string' ||
            typeof confirmPassword !== 'string'
        ) {
            return res.status(400).send('Invalid password information');
        }
        if (newPassword.length < 12 || newPassword.length > 72) {
            return res.status(400).send(
                'New password must be between 12 and 72 characters'
            );
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).send(
                'Passwords do not match'
            );
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword, 
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(400).send(
                'Current password is incorrect'
            );
        }

        const newHash = await bcrypt.hash(newPassword, 12);

        await pool.query(
            `UPDATE users
            SET password_hash = $1
            WHERE id = $2`,
            [newHash, userId]
        );

        res.redirect('/dashboard/security?updated=1');
    }catch (err) {
        console.error(err);
        next(err);
    }
};

// employee controller
export const showEmployeeDashboard = (req, res) => {
    res.render('dashboard/employee', {
        title: 'Employee Dashboard', 
        user: req.session.user
    });
};


// admin dashboard controller
export const showAdminDashboard = (req, res) => {
    res.render('dashboard/admin', {
        title: 'Admin Dashboard', 
        user: req.session.user
    });
};