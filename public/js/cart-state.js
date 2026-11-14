export const CART_KEY = 'cart';

function getCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Could not load cart:', err);
        return[];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
}

export function addToCart(product, quantity = 1) {
    const cart = loadCart();
    const productId = String(product.id);

    const existingItem = cart.find((item) => String(item.id) === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id, 
            name: product.name, 
            price: Number(product.price),
            image: product.image || '',
            quantity, 
        });
    }
    saveCart(cart);
    return cart;
}

export function removeFromCart(productId) {
    const cart = getCart().filter((item) => String(item.id) !== String(productId));
    saveCart(cart);
    return cart;
}

export function updateQuantity(productId, quantity) {
    const updatedCart = getCart() 
        .map((item) => (String(item.id) === String(productId) ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);
    saveCart(updatedCart);
    return updatedCart;
}

export function clearCart() {
    saveCart([]);
}

export function getCartItemCount() {
    return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal() {
    return getCart().reduce((total, item) => total + Number(item.price) * item.quantity, 0);
}