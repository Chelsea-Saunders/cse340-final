
export const validateContactResponse = (req, res, next) => {
    const { response } = req.body;

    if (
        typeof response !== 'string' || 
        !response.trim() || 
        response.trim().length > 5000
    ) {
        return res.status(400).send('Invalid response');
    }

    req.body.response = response.trim();
    next();
};

export const validateContactSubmission = (req, res, next) => {
    const { name, email, subject, message } = req.body ?? {};

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

    req.body.name = cleanName;
    req.body.email = cleanEmail;
    req.body.subject = cleanSubject;
    req.body.message = cleanMessage;

    next();
}