export const validateId = (source, field) => {
    return (req, res, next) => {
        const value = req[source]?.[field];

        if (
            typeof value !== 'string' &&
            typeof value !== 'number'
        ) {
            return res.status(400).send('Invalid ID');
        }

        if (!/^\d+$/.test(String(value))) {
            return res.status(400).send('Invalid Id');
        }

        const id = Number(value);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).send('Invalid Id');
        }

        req.validatedId = id;

        next();
    };
};