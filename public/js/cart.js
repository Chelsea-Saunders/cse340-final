import { 
    getCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartItemCount, 
    getCartTotal
 } from './cart-state.js';

document.addEventListener('DOMContentLoaded', () => {
    const cartItems = document.querySelector('[data-cart-items]');
    const cartCount = document.querySelector('[data-cart-count]');

    // always update header badge count even on non-cart pages
    function updateBadge() {
        if(cartCount) {
            cartCount.textContent = getCartItemCount();
        }
    }

    updateBadge();
    window.addEventListener('cart:updated', updateBadge);

    if (!cartItems) return;

    const cartTotal = document.querySelector('[data-cart-total]');
    const emptyMessage = document.querySelector('[data-cart-empty]');
    const clearButton = document.querySelector('[data-clear-cart]');

    function renderCart() {
        const cart = getCart();
        updateBadge();

        if (cartTotal) {
            cartTotal.textContent = `$${getCartTotal().toFixed(2)}`;
        }

        if (!cart.length) {
            cartItems.innerHTML = '';
            if (emptyMessage) emptyMessage.hidden = false;
            return;
        }

        if (emptyMessage) emptyMessage.hidden = true;

        cartItems.innerHTML = cart 
            .map(
                (item) => `
                    <article class="cart-item" data-product-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}"></img>
                        <div>
                            <h3>${item.name}</h3>
                            <p>$${Number(item.price).toFixed(2)}</p>

                            <div class="cart-item-controls">
                                <button type="button" data-action="decreased">-</button>
                                <span>${item.quantity}</span>
                                <button type="button" data-action="increase">+</button>
                                <button type="button" data-action="remove">Remove</button>
                            </div>
                        </div>
                    </article>
                `
            )
            .join('');
        }

        cartItems.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const item = event.target.closest('[data-product-id]');
            if (!item) return;

            const productId = item.dataset.productId;
            const action = button.dataset.action;

            const currentItem = cart.find((entry) => String(entry.id) === String(productId));
            if (!currentItem) return;

            if (action === 'remove') removeFromCart(productId);
            if (action === 'increase') updateQuantity(productId, currentItem.quantity + 1);
            if (action === 'decrease') updateQuantity(productId, currentItem.quantity - 1);

            renderCart();
    });

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            clearCart();
            renderCart();
        });
    }

    window.addEventListener('cart:updated', renderCart);
    renderCart();
});