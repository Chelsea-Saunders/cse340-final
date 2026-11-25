import { addToCart } from './cart-state.js';

document.addEventListener('DOMContentLoaded', () => {
    const detailRoot = document.querySelector('[data-product-detail]');
    if (!detailRoot) return;

    const addButton = detailRoot.querySelector('[data-add-to-cart]');
    const message = detailRoot.querySelector('[data-cart-message]');
    const quantityInput = detailRoot.querySelector('#quantity');
    const stockStatus = detailRoot.querySelector('.stock-status');
    const productId = Number(detailRoot.dataset.productId);
    const productName = detailRoot.dataset.productName;

    if (!addButton) return;

    let isAdding = false;
    let isRefreshing = false;

    function updateAvailability(available) {
        stockStatus.classList.remove(
            'out-of-stock',
            'low-stock',
            'in-stock'
        );

        if (available === 0) {
            stockStatus.textContent = 'Out of Stock';
            stockStatus.classList.add('out-of-stock');
        } else if (available === 1) {
            stockStatus.textContent = `Only ${available} left!`;
            stockStatus.classList.add('low-stock');
        } else {
            stockStatus.textContent = `In Stock: ${available} available`;
            stockStatus.classList.add('in-stock');
        }

        const maxQuantity = Math.min(available, 10);

        quantityInput.max = maxQuantity;
        quantityInput.disabled = available === 0;

        if (available === 0) {
            quantityInput.value = 1;
        } else if (Number(quantityInput.value) > maxQuantity) {
            quantityInput.value = maxQuantity;
        }

        addButton.disabled = available === 0 || isAdding;
        addButton.textContent = available === 0
            ? 'Out of Stock'
            : 'Add to Cart';
    }

    // get inventory from server
    async function refreshAvailability() {
        if (isRefreshing) return;

        isRefreshing = true;

        try {
            const response = await fetch(
                `/shop/item/${productId}/availability`,
                { cache: 'no-store' }
            );

            if (!response.ok) {
                throw new Error('Unable to retrieve inventory');
            }

            const data = await response.json();
            updateAvailability(data.available_quantity);
        } catch (err) {
            console.error('Unable to refresh inventory:', err);
        } finally {
            isRefreshing = false;
        }
    }

    addButton.addEventListener('click', async () => {
        if (isAdding) return;

        const quantity = Number(quantityInput.value);

        if (!quantityInput.checkValidity()) {
            quantityInput.reportValidity();
            return;
        }

        isAdding = true;
        addButton.disabled = true;

        try {
            await addToCart({id: productId }, quantity);
            message.textContent = `${productName} added to cart!`;

        } catch (err) {
            console.error('Unable to add item to cart', err);
            message.textContent = 
            `Unable to add ${productName} to cart: ${err.message}`;

        } finally {
            isAdding = false;
            addButton.disabled = Number(quantityInput.max) === 0;

            await refreshAvailability();
        }
    });
    // get current inventory when page loads
    refreshAvailability();

    // update to new invntory every 5 seconds
    setInterval(refreshAvailability, 5000);
});