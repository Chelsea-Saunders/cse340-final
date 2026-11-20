document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('[data-product-card]');
    if (!cards.length) return;

    const SELECTED_KEY = 'selectedProductId';

    function selectCard(card) {
        cards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        sessionStorage.setItem(SELECTED_KEY, card.dataset.productId);
    }

    // restore previous selection if the page reloads
    const savedId = sessionStorage.getItem(SELECTED_KEY);
    if (savedId) {
        const savedCard = [...cards].find((card) => card.dataset.productId === savedId);
        if (savedCard) savedCard.classList.add('selected');
    }

    cards.forEach((card) => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button, a')) return;

            selectCard(card);
        });
    });
});