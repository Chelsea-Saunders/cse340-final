import { addToCart } from './cart-state.js';

document.addEventListener('DOMContentLoaded', () => {
    const detailRoot = document.querySelector('[data-product-detail]');
    if (!detailRoot) return;

    const addButton = detailRoot.querySelector('[data-add-to-cart]');
    const message = detailRoot.querySelector('[data-cart-message]');
    const quantityInput = detailRoot.querySelector('#quantity');
    const productId = Number(detailRoot.dataset.productId);
    const productName = detailRoot.dataset.productName;

    if (!addButton) return;

    addButton.addEventListener('click', async () => {
        const quantity = Number(quantityInput.value);

        addButton.disabled = true;

        try {
            await addToCart({id: productId }, quantity);
            message.textContent = `${productName} added to cart!`;

        } catch (err) {
            console.error('Unable to add item to cart', err);
            message.textContent = `Unable to add ${productName} to cart`;

        } finally {
            addButton.disabled = false;
        }
    });
});