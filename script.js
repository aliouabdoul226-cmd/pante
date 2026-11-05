/**
 * Nature Emoi - Interactive Scripts
 * Features:
 * - Mobile navigation menu toggle and outside-click handling
 * - Header style transition on scroll
 * - Smooth navigation scrolling and back-to-top button
 * - Plant quick view / modal popup
 * - Shopping cart management (add, remove, update quantity, local persistence)
 * - Toast notification system
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Mobile Menu (Burger)
    // ==========================================
    const burgerContainer = document.querySelector('.burger-container');
    const navLinks = document.querySelector('.nav-links');

    if (burgerContainer && navLinks) {
        burgerContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            burgerContainer.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burgerContainer.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!burgerContainer.contains(e.target) && !navLinks.contains(e.target)) {
                burgerContainer.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 2. Header & Scroll to Top
    // ==========================================
    const header = document.querySelector('.header');
    const backToTopBtn = document.getElementById('back-to-top');

    const handleScroll = () => {
        const scrollPos = window.scrollY || window.pageYOffset;

        // Sticky header styling
        if (header) {
            if (scrollPos > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Back to top button visibility
        if (backToTopBtn) {
            if (scrollPos > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ==========================================
    // 3. Toast Notifications
    // ==========================================
    const toast = document.getElementById('toast');
    let toastTimeout = null;

    const showToast = (message, duration = 3000) => {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    };

    // ==========================================
    // 4. Shopping Cart System
    // ==========================================
    const CART_STORAGE_KEY = 'nature_emoi_cart';
    let cart = [];

    const loadCart = () => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (saved) {
                cart = JSON.parse(saved);
            }
        } catch {
            cart = [];
        }
    };

    const saveCart = () => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch {
            // Storage quota or disabled storage
        }
    };

    const cartCountEl = document.getElementById('cart-count');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total-price');
    const cartModal = document.getElementById('cart-modal');
    const cartBtn = document.getElementById('cart-btn');
    const cartClearBtn = document.getElementById('cart-clear-btn');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    const updateCartUI = () => {
        // Update badge
        const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        if (cartCountEl) {
            cartCountEl.textContent = totalCount;
        }

        // Update cart modal contents
        if (!cartItemsEl || !cartTotalEl) return;

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="cart-empty-message">Votre panier est vide.</p>';
            cartTotalEl.textContent = '0,00€';
            return;
        }

        let total = 0;
        cartItemsEl.innerHTML = '';

        cart.forEach((item) => {
            const numPrice = parseFloat(item.price.replace('€', '').replace(',', '.').trim()) || 0;
            const subtotal = numPrice * item.quantity;
            total += subtotal;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${escapeHTML(item.name)}</span>
                    <span class="cart-item-price">${item.price} &times; ${item.quantity} = ${subtotal.toFixed(2).replace('.', ',')}€</span>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="cart-qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    <button type="button" class="cart-remove-btn" data-action="remove" data-id="${item.id}" aria-label="Supprimer">&times;</button>
                </div>
            `;
            cartItemsEl.appendChild(itemEl);
        });

        cartTotalEl.textContent = `${total.toFixed(2).replace('.', ',')}€`;
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        saveCart();
        updateCartUI();
        showToast(`${product.name} ajouté au panier ! 🌿`);
    };

    const updateQuantity = (id, delta) => {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        saveCart();
        updateCartUI();
    };

    const removeFromCart = (id) => {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartUI();
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        cart = [];
        saveCart();
        updateCartUI();
        showToast('Panier vidé.');
    };

    if (cartItemsEl) {
        cartItemsEl.addEventListener('click', (e) => {
            const target = e.target.closest('button[data-action]');
            if (!target) return;

            const action = target.getAttribute('data-action');
            const id = target.getAttribute('data-id');

            if (action === 'increase') updateQuantity(id, 1);
            else if (action === 'decrease') updateQuantity(id, -1);
            else if (action === 'remove') removeFromCart(id);
        });
    }

    if (cartClearBtn) {
        cartClearBtn.addEventListener('click', clearCart);
    }

    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Votre panier est vide !');
                return;
            }
            showToast('Merci pour votre commande ! 🌱📦');
            cart = [];
            saveCart();
            updateCartUI();
            closeModal(cartModal);
        });
    }

    // ==========================================
    // 5. Modal Management
    // ==========================================
    const plantModal = document.getElementById('plant-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDesc = document.getElementById('modal-description');
    const modalAddCartBtn = document.getElementById('modal-add-cart');

    let currentModalProduct = null;

    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    // Close modals on backdrop click or close button click
    document.querySelectorAll('.modal-backdrop').forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('.modal-close') || e.target.closest('.modal-close-btn')) {
                closeModal(modal);
            }
        });
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(plantModal);
            closeModal(cartModal);
        }
    });

    // Plant cards click event
    const plantCards = document.querySelectorAll('.plant-box');
    plantCards.forEach((card) => {
        card.addEventListener('click', (e) => {
            e.preventDefault();

            const id = card.getAttribute('data-id') || 'plant-' + Math.random().toString(36).substr(2, 9);
            const name = card.getAttribute('data-name') || card.querySelector('.plant-name')?.textContent?.trim() || 'Plante';
            const price = card.getAttribute('data-price') || card.querySelector('.plant-price')?.textContent?.trim() || '29,99€';
            const description = card.getAttribute('data-description') || 'Superbe plante sélectionnée avec soin par nos horticulteurs passionnés.';

            currentModalProduct = { id, name, price, description };

            if (modalTitle) modalTitle.textContent = name;
            if (modalPrice) modalPrice.textContent = price;
            if (modalDesc) modalDesc.textContent = description;

            openModal(plantModal);
        });
    });

    if (modalAddCartBtn) {
        modalAddCartBtn.addEventListener('click', () => {
            if (currentModalProduct) {
                addToCart(currentModalProduct);
                closeModal(plantModal);
            }
        });
    }

    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            updateCartUI();
            openModal(cartModal);
        });
    }

    // Helper function
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initialize cart state
    loadCart();
    updateCartUI();
});
