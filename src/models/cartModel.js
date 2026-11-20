import * as productModel from './productModel.js';

// retrieve cart product details
export const getCartItems = async (cart) => {
    const items = await Promise.all(
        cart.map(async (item) => {
            const product = await productModel.getProductById(
                item.productId
            );

            if (!product) return null;
            
            return {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.image_med || product.image_sm,
                quantity: item.quantity,
                subtotal: Number(product.price) * item.quantity
            };
        })
    );

    return items.filter(item => item !== null);
}

// Add product to cart
export const addToCart = (cart, productId, quantity = 1) => {
    const existingItem = cart.find(
        item => item.productId === productId
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId, 
            quantity
        });
    }
    return cart;
};

// update product quantity
export const updateQuantity = (cart, productId, quantity) => {
    return cart 
        .map(item => 
            item.productId === productId
                ? { ...item, quantity }
                : item
        )
        .filter(item => item.quantity > 0);
};

// remove product from cart
export const removeFromCart = (cart, productId) => {
    return cart.filter(
        item => item.productId !== productId
    );
};

// clear cart
export const clearCart = () => {
    return [];
};

// calculate item count
export const getCartItemCount = (cart) => {
    return cart.reduce(
        (total, item) => total + item.quantity,
        0
    );
};

// calculate cart total
export const getCartTotal = (items) => {
    const totalCents = items.reduce(
        (total, item) => 
            total + Math.round(item.price * 100) * item.quantity,
        0
    );
    return totalCents / 100;
};