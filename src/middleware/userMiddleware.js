export const validateProfileName = (req, res, next) => {
    const name = typeof req.body?.name === 'string'
    ? req.body.name.trim()
    : '';
    
    if (!name || name.length > 100) {
        return res.status(400).send(
            'Name must be between 1 and 100 characters'
        );
    }
    req.body.name = name;

    next();
};

export const validatePasswordChange = (req, res, next) => {
    const {
        currentPassword, 
        newPassword, 
        confirmPassword
    } = req.body;

    if (
        typeof currentPassword !== 'string' ||
        typeof newPassword !== 'string' ||
        typeof confirmPassword !== 'string' ||
        !currentPassword
    ) {
        return res.status(400).send(
            'Invalid password information'
        );
      };

      if (
        newPassword.length < 8 || 
        Buffer.byteLength(newPassword, 'utf8') > 72
        ) {
        return res.status(400).send(
            'New password must be between 8 and no more than 72 bytes'
        );
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).send(
            'Passwords do not match'
        );
    }
    next();
};