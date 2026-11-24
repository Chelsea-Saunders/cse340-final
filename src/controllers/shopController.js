
import * as productModel from '../models/productModel.js';

export const showAll = async (req, res, next) => {
    try {
        const products = await productModel.getAllProducts();
        res.render('shop/shop-all', { title: 'Shop All', products })
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const showLeather = async (req, res, next) => {
    try {
        const products = await productModel.getProductsByCategory('leather');
        res.render('shop/leather', { title: 'Leather', products });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const showPhotography = async (req, res, next) => {
    try {
        const products = await productModel.getProductsByCategory('photography');
        res.render('shop/photography', { title: 'Photography', products });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const showPrints = async (req, res, next) => {
    try {
        const products = await productModel.getProductsByCategory('screen-prints');
        res.render('shop/screen-prints', { title: 'Screen Prints', products });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const showItem = async (req, res, next) => {
    try {
        const product = await  productModel.getProductById(req.params.id);

        if (!product) {
            const err = new Error('Product not found');
            err.status = 404;
            return next(err);
        }
        res.render('shop/item-details', { title: 'Item Details', product });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

export const getProductAvailability = async (req, res, next) => {
    try {
        const product = await productModel.getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        res.set('Cache-Control', 'no-store');

        res.json({
            id: product.id,
            available_quantity: product.available_quantity
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
};