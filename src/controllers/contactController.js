import pool from '../db/pgSQL.js';

export const showContact = (req, res) => {
    res.render('contact/contact-index', {
        title: 'Contact Us',
        success: req.query.success === 'true'
    });
};

export const submitContact = async (req, res, next) => {
    const { name, email, subject, message } = req.body;

    if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof subject !== 'string' ||
        typeof message !== 'string'
    ) {
        return res.status(400).send('Invalid form submission');
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (
        !cleanName ||
        !cleanEmail ||
        !cleanSubject ||
        !cleanMessage ||
        cleanName.length > 100 ||
        cleanEmail.length > 255 ||
        cleanSubject.length > 150 ||
        cleanMessage.length > 5000 
    ) {
        return res.status(400).send('invalid contact information');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).send('Invalid email address');
    }

    const userId = req.session?.user?.id ?? null;

    try {
        await pool.query(
            `INSERT INTO contact_messages
            (user_id, name, email, subject, message)
            VALUES ($1, $2, $3, $4, $5)`,
            [
                userId, 
                cleanName, 
                cleanEmail,
                cleanSubject, 
                cleanMessage
            ]
        );

        return res.redirect('/contact?success=true');
    } catch (err) {
        return next(err);
    }
};