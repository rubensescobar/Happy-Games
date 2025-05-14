document.addEventListener('DOMContentLoaded', function() {
    const cartIconLink = document.querySelector('a[href="pages/cart.html"]');

    if (cartIconLink) {
        // Removed the event listener that prevented default navigation and called the modal.
        // The link's default behavior will now navigate to cart.html.
    }
});  