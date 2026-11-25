import bcrypt from 'bcrypt';

import {
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct
} from '../models/productModel.js';

import * as userModel from '../models/userModel.js';
import * as contactModel from '../models/contactModel.js';


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
        const imagePath = `/uploads/products/${req.file.filename}`;

        await createProduct({
            ...req.body,
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
        const product = await getProductById(req.validatedId);

        if (!product) {
            const err = new Error('Product not found');
            err.status = 404;
            return next(err);
        }
        res.render('dashboard/edit', { title: 'Edit Product', product });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const editProduct = async (req, res, next) => {
    try {
        const existingProduct = await getProductById(req.validatedId);

        if(!existingProduct) {
            return res.status(404).send('Product not found');
        }

        const imagePath = req.file
            ?`/uploads/products/${req.file.filename}`
            : null;

        await updateProduct(validatedId, {
            ...req.body,
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
        await deleteProduct(req.validatedId);
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
        const user = await userModel.getUserProfile(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('dashboard/profile', {
            title: 'My Profile',
            user,
            hasPassword: user.has_password,
            updated: req.query.updated === '1',
            passwordUpdated: req.query.passwordUpdated === '1'
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const name = req.body.name;

        const user = await userModel.updateUserName(userId, name);

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
        console.error(err);
        next(err);
    }
};

export const showSecurity = async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const user = await userModel.getUserPassword(userId);

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
        console.error(err);
        next(err);
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        const userId = req. session.user.id;
        const {currentPassword, newPassword } = req.body;

        const user = await userModel.getUserPassword(userId);

        if(!user) {
            return res.status(404).send('User not found');
        }  

        // google accounts that dont have local password
        if (!user.password_hash) {
            return res.status(403).send(
                'Password changes are unavailable for this account'
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

        const newHash = await bcrypt.hash(newPassword, 8);

        const updated = await userModel.updateUserPassword(
            userId, 
            newHash
        );

        if (!updated) {
            return res.status(404).send('User not found');
        }

        res.redirect('/dashboard/profile?passwordUpdated=1');

    } catch (err) {
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

export const showManageEmployees = async (req, res, next) => {
    try {
        const employees = await userModel.getUserByRole('employee');
        const customers = await userModel.getUserByRole('user');
        // const admins = await userModel.getUserByRole('admin');

        console.log('Employees:', employees);
        console.log('Type:', typeof employees);
        console.log('Is array:', Array.isArray(employees));




        res.render('dashboard/admin-employee', {
            title: 'Employee Management',
            user: req.session.user,
            employees,
            customers,
            // admins
        });

    } catch (err) {
        console.error('Unable to load employees:', err);
        next(err);
    }
};

export const addEmployee = async (req, res, next) => {
    try {
        const updated = await userModel.updateUserRole(
            req.validatedId, 
            'employee',
            'user'
        );

        if (!updated) {
            return res.status(400).send('Unable to add employee');
        }

        return res.redirect('/dashboard/employees');
    } catch (err) {
        return next(err);
    }
};

export const removeEmployee = async (req, res, next) => {

    try {
        const updated = await userModel.updateUserRole(
            req.validatedId, 
            'user', 
            'employee'
        );

        if (!updated) {
            return res.status(400).send('Unable to remove empoyee');
        }

        return res.redirect('/dashboard/employees');

    } catch (err) {
        return next(err);
    }
};

export const showContactMessages = async (req, res, next) => {
    try {
        const messages = await contactModel.getAllContactMessages();

        res.render('contact/contact-responses', {
            title: 'Contact Messages', 
            user: req.session.user,
            messages
        });
    } catch (err) {
        return next(err);
    }
};

export const respondToContactMessage = async (req, res, next) => {
    try {
        const updated = await contactModel.respondToMessage(
            req.validatedId,
            req.body.response,
            req.session.user.id
        );
        if(!updated) {
            return res.status(400).send('Unable to respond to message')
        }

        return res.redirect('/dashboard/contact-messages');

    } catch (err) {
        return next(err);
    }
};

export const showMyMessages = async (req, res, next) => {
    try {
        const messages = await contactModel.getContactMessagesByUserId(
            req.session.user.id
        );

        res.render('dashboard/my-messages', {
            title: 'My Messages', 
            user: req.session.user, 
            messages
        });
        
    } catch (err) {
        return next(err);
    }
};