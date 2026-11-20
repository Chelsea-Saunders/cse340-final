

export async function cartRequest(endpoint, data) {
    const options = data === undefined
        ? { method: 'GET' }
        : {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

    const response = await fetch (
        `/cart${endpoint}`,
        options
    );

    if (!response.ok) {
        throw new Error(
            `Cart request failed: ${response.status}`
        );
    }

    return response.json();
}

 export async function modifyCart(endpoint, data) {
    const cart = await cartRequest(endpoint, data);

    window.dispatchEvent(
        new CustomEvent('cart:updated', {
            detail: cart
        })
    );

    return cart;
}

export function getCart() {
    return cartRequest('/data');
}

export function addToCart(product, quantity = 1) {
    return modifyCart('/add', {
        productId: product.id,
        quantity
    });
}

export function removeFromCart(productId) {
    return modifyCart('/remove', {
        productId
    });
}

export function updateQuantity(productId, quantity) {
    return modifyCart('/update', {
        productId, 
        quantity
    });
}

export function clearCart() {
    return modifyCart('/clear', {});
}