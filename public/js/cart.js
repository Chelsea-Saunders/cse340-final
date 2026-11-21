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

 function createCartItem(item) {
    const article = document.createElement('article');

    article.className = 'cart-item';
    article.dataset.productId = item.id;

    // product image
    const image = document.createElement('img');

    if (item.image) {
        const imageUrl = new URL (
            item.image, 
            window.location.origin
        );

        if (
            imageUrl.origin === window.location.origin &&
            imageUrl.pathname.startsWith('/images/')
        ) {
            image.src = imageUrl.href;
        }
    }
    image.alt = item.name;

    // product info
    const info = document.createElement('div');

    const name = document.createElement('h3');
    name.textContent = item.name;

    const price = document.createElement('p');
    price.textContent = `$${Number(item.price).toFixed(2)}`;

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

    info.append(name, price, controls);
    article.append(image, info);

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
                'Unable to update your cart. Please try again.'
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
            'Unable to load your shopping cart. Please refresh'
        );
    } finally {
        setUpdating(false);
    }
});