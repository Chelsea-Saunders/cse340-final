import {
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct
} from '../models/productModel.js';

export const showDashboard = async (req, res, next) => {
    try {
        const products = await getAllProducts();
        res.render('dashboard/dashboard-index', { title: 'Dashboard', products });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const showAddForm = (req, res) => {
    res.render('dashboard/edit', { title: 'Add Product', product: null });
};

export const addProduct = async (req, res, next) => {
    try {
        await createProduct(req, body);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const showEditForm = async (req, res, next) => {
    try {
        const product = await getProductById(req.params.id);
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
        await updateProduct(req.params.id, req.body);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const removeProduct = async (req, res, next) => {
    try {
        await deleteProduct(req.params.id);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        next(err);
    }
};