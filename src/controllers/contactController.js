import * as contactModel from '../models/contactModel.js';

export const showContact = (req, res) => {
    res.render('contact/contact-index', {
        title: 'Contact Us',
        success: req.query.success === 'true'
    });
};

export const submitContact = async (req, res, next) => {
    const { name, email, subject, message } = req.body;

    const userId = req.session?.user?.id ?? null;

    try {
        const created = await contactModel.createContactMessage({
            userId, 
            name, 
            email,
            subject, 
            message
        });
            
        if (!created) { 
            throw new Error('Una ble to create contact message');
        }
        return res.redirect('/contact?success=true');
        
    } catch (err) {
        return next(err);
    }
};