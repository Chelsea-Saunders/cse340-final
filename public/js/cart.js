import { 
    getCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart
 } from './cart-state.js';

 //create button function
 function createCartButton(action, text, label) {
    const button = document.createElement('button')

    button.type = 'button';
    button.dataset.action = action;
    button.textContent = text;
    button.setAttribute('aria-label', label);
    
    return button;
 }

 function formatTimeRemaining(expiresAt) {
    const remaining = Math.max(
        0,
        new Date(expiresAt).getTime() - Date.now()
    );

    const totalSeconds = Math.ceil(remaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
 }

 function createCartItem(item) {
    const article = document.createElement('article');

    article.className = 'cart-item';
    article.dataset.productId = item.id;

    const productUrl = `/shop/item/${encodeURIComponent(item.id)}`;

    // product image
    const image = document.createElement('img');
    const imageLink = document.createElement('a');
    imageLink.href = productUrl;
    imageLink.className = 'cart-product-image-link';
    imageLink.append(image);

    if (item.image) {
        try {
            const imageUrl = new URL(
                item.image,
                window.location.origin
            );

            if (imageUrl.origin === window.location.origin) {
                image.src = imageUrl.href;
            }
        } catch (err) {
            console.error('Invalid product image url:', err);
        }
    }
    image.alt = item.name;

    // product info
    const info = document.createElement('div');

    const name = document.createElement('h3');
    const nameLink = document.createElement('a');
    nameLink.href = productUrl;
    nameLink.textContent = item.name;
    nameLink.className = 'cart-product-name-link';
    name.append(nameLink);

    const price = document.createElement('p');
    price.textContent = `$${Number(item.price).toFixed(2)}`;

    const timer = document.createElement('p');

    timer.className = 'reservation-timer';
    timer.dataset.expiresAt = item.expiresAt;

    timer.textContent = `Reserved for: ${formatTimeRemaining(item.expiresAt)}`;

    // quantity controls
    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';

    const decreaseButton = createCartButton(
        'decrease', '-', 'Decrease quantity'
    );

    const quantity = document.createElement('span');
    quantity.textContent = item.quantity;

    const increaseButton = createCartButton(
        'increase', '+', 'Increase quantity'
    );

    const removeButton = createCartButton(
        'remove', 'Remove', 'Remove Item'
    );

    // assemble the elements
    controls.append(
        decreaseButton, 
        quantity, 
        increaseButton, 
        removeButton
    );

    info.append(name, price, timer, controls);
    article.append(imageLink, info);

    return article;
}

document.addEventListener('DOMContentLoaded', async () => {

    const cartItems = document.querySelector('[data-cart-items]');
    const cartCount = document.querySelector('[data-cart-count]');
    const cartTotal = document.querySelector('[data-cart-total]');
    const emptyMessage = document.querySelector('[data-cart-empty]');
    const clearButton = document.querySelector('[data-clear-cart]');
    const errorMessage = document.querySelector('[data-cart-error]');
    const checkoutButton = document.querySelector('[data-checkout]');

    let currentCart = {
        items: [],
        count: 0,
        total: 0
    };

    let isUpdating = false;

    // update reservation countdowns
    function updateReservationTimers() {
        const timers = document.querySelectorAll(
            '.reservation-timer[data-expires-at]'
        );

        timers.forEach(timer => {
            const expiresAt = timer.dataset.expiresAt;

            const remaining = Math.max(
                0,
                new Date(expiresAt).getTime() - Date.now()
            );

            timer.textContent = remaining === 0
                ? 'Reservation expired'
                : `Reserved for: ${formatTimeRemaining(expiresAt)}`;

            timer.classList.toggle(
                'reservation-warning', 
                remaining <= 60000
            );
        });

        const hasExpired = currentCart.items.some(item => 
            new Date(item.expiresAt).getTime() <= Date.now()
        );

        if (hasExpired && !isUpdating) {
            refreshExpiredCart();
        }
    }

    // refresh cart after timer expires
    async function refreshExpiredCart() {
        if (isUpdating) return;

        setUpdating(true);

        try {
            const cart = await getCart();

            renderCart(cart);
        } catch (err) {
            console.error('Unable to refresh expired cart:', err);
        } finally {
            setUpdating(false);
        }
    }

    // cart errors
    function showError(message = '') {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.hidden = !message;
        }
    }

    // always update header badge count even on non-cart pages
    function updateBadge(count) {
        if(cartCount) {
            cartCount.textContent = count;
        }
    }

    // enable/disable cart button
    function setUpdating(updating) {
        isUpdating = updating;

        cartItems?.querySelectorAll('button').forEach(button => {
            button.disabled = updating;
        });

        if (clearButton) {
            clearButton.disabled = updating;
        }

        if (checkoutButton) {
            checkoutButton.style.pointerEvents = updating ? 'none' : '';
            checkoutButton.setAttribute(
                'aria-disabled',
                String(updating)
            );
        }
    }
    
    function renderCart(cart) {
        currentCart = cart;
        // update badge on ALL pages
        updateBadge(cart.count);

        // render product on cart page
        if (!cartItems) return;

        const isEmpty = cart.items.length === 0;

        // update total
        if (cartTotal) {
            cartTotal.textContent = `$${Number(cart.total).toFixed(2)}`;
        }

        // update empty cart message
        if (emptyMessage) {
            emptyMessage.hidden = !isEmpty;
        }

        // update clear cart button
        if(clearButton) {
            clearButton.hidden = isEmpty;
        }

        // show checkout button only when items are in cart
        if (checkoutButton) {
            checkoutButton.hidden = isEmpty;
        }

        // create and display product cards
        const elements = cart.items.map(createCartItem);

        cartItems.replaceChildren(...elements);

        // keep button state consistent after rendering
        setUpdating(isUpdating);
    }

    async function performCartAction(action) {
        if (isUpdating) return;

        setUpdating(true);
        showError();

        try {
            await action();
        } catch (err) {
            console.error('Cart operation failed:', err);

            showError(
                'Cannot add more items to your cart than are available.'
            );
        } finally { 
            setUpdating(false);
        }
    }

    // quantity and remove buttons
    if (cartItems) {
        cartItems.addEventListener('click', async (event) => {
            const button = event.target.closest(
                'button[data-action]'
            );
            if (!button || isUpdating) return;

            const item = event.target.closest('[data-product-id]');
            if (!item) return;

            const productId = Number(item.dataset.productId);
            const action = button.dataset.action;

            const currentItem = currentCart.items.find(
                entry => Number(entry.id) === productId
            );
            if (!currentItem) return;

            await performCartAction(async () => {
                switch (action) {
                    case 'remove':
                        await removeFromCart(productId);
                        break;
                    
                    case 'increase':
                        await updateQuantity(
                            productId,
                            currentItem.quantity + 1
                        );
                        break;

                    case 'decrease': 
                        await updateQuantity(
                            productId, 
                            currentItem.quantity -1
                        );
                        break;
                    }
                });
        });
    }

    // clear cart button
    if (clearButton) {
        clearButton.addEventListener('click', async () => {
            await performCartAction(clearCart);
        });
    }

    // listen for updates from cart
    window.addEventListener('cart:updated', (event) => {
        renderCart(event.detail);
    });

    // load cart from server
    setUpdating(true);

    try {
        const cart = await getCart();

        renderCart(cart);

    } catch (err) {
        console.error('Unable to load cart:', err);

        showError(
            err.message || 'Unable to load your shopping cart. Please refresh'
        );
    } finally {
        setUpdating(false);
    }

     // countdown
        updateReservationTimers();
        setInterval(updateReservationTimers, 1000);
});