import { Router } from 'express';

const router = Router();


// BASIC PAGES
router.get('/', (req, res) => {
    res.render('home/index');
});
router.get('/about-me', (req,res) => {
    res.render('about/me');
});
router.get('/all-items', async (req, res) => {
    const products = await Product.find();
    res.render('shop/all', { products });
});
router.get('/leather', async (req, res) => {
    const products = await Product.find({ category: 'leather' });
    res.render('shop/leather', { products });
});
router.get('/photography', async (req, res) => {
    const products = await Product.find({ category: 'photography' });
    res.render('shop/photography', { products });
});
router.get('/dashboard', (req, res) => {
    res.render('dashboard/index');
});
router.get('/contact-us', (req, res) => {
    res.render('contact/index');
});
router.get('/wearables', async (req, res) => {
    const products = await Product.find({ category: 'wearables' });
    res.render('/shop/wearables', { products });
})

export default router;