
document.addEventListener('DOMContentLoaded', function() {

    const container = document.querySelector('.dropdown-container');
    const menu = document.getElementById('dropdown-links');
    const hamburger = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    if (!container || !menu || !hamburger || !closeIcon) {
        console.error('Missing nav elements');
        return;
    }

    // open nav
    function openMenu() {
        menu.classList.add('show');
        container.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        closeIcon.focus();
    }

    // close nav
    function closeMenu(restoreFocus = false) {
        menu.classList.remove('show');
        container.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');

        if(restoreFocus) {
            hamburger.focus();
        }
    }

    // hamburger click
    hamburger.addEventListener('click', openMenu);

    // close icon
    closeIcon.addEventListener('click', function() {
        closeMenu(true);
    });

    // close when clicking outside nav
    document.addEventListener('click', function(event) {
        if (!container.contains(event.target)) {
            closeMenu();
        }
    });

    // close on esc
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && menu.classList.contains('show')) {
            closeMenu(true);
        }
    });

    // reset mobile menu on large screens
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 901) {
            closeMenu();
        }
    });
});