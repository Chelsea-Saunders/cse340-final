import { addToCart } from './cart-state.js';

document.addEventListener('DOMContentLoaded', () => {
    const detailRoot = document.querySelector('[data-product-detail]');
    if (!detailRoot) return;

    const addButton = detailRoot.querySelector('[data-add-to-cart]');
    const quantityInput = detailRoot.querySelector('[data-uantity]');
    const message = detailRoot.querySelector('[data-cart-message]');

    if (!addButton) return;

    addButton.addEventListener('click', () => {
        const quantity = Math.max(1, Number(quantityInput?.value || 1));

        const product = {
            id: detailRoot.dataset.productId, 
            name: detailRoot.dataset.productName, 
            price: Number(detailRoot.dataset.productPrice),
            image: detailRoot.dataset.productImage,
        };
        addToCart(product, quantity);

        if (message) {
            message.textContent = `${product.name} added to cart.`;
        }
    });
});