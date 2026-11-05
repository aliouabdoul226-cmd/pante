document.addEventListener('DOMContentLoaded', () => {
    const burgerContainer = document.querySelector('.burger-container');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (burgerContainer && navLinks) {
        // Basculer l'affichage du menu burger
        burgerContainer.addEventListener('click', (event) => {
            event.stopPropagation();
            burgerContainer.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Fermer le menu lors du clic sur un lien de navigation
        navItems.forEach((link) => {
            link.addEventListener('click', () => {
                burgerContainer.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Fermer le menu lors d'un clic à l'extérieur
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = navLinks.contains(event.target);
            const isClickOnBurger = burgerContainer.contains(event.target);

            if (!isClickInsideMenu && !isClickOnBurger && navLinks.classList.contains('active')) {
                burgerContainer.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
});
