function parseStockQuantity(value) {
    if (
        typeof value !== 
        'string' || !/^\d+$/.test(value)
    ) {
        return null;
    }

    const quantity = Number(value);

    if (
        !Number.isSafeInteger(quantity) || 
        quantity < 0 ||
        quantity > 2147483647
    ) {
        return null;
    }

    return quantity;
}

export const validateStockQuantity = (req, res, next) => {
    const stockQuantity = parseStockQuantity(
        req.body.stock_quantity
    );

    if (stockQuantity === null) {
        return res.status(400).send(
            'The quantity amount must me a non-negative whole number'
        );
    }

    req.body.stock_quantity = stockQuantity;

    next();
};

export const requireProductImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).send(
            'Please upload a product image'
        );
    }

    next();
};