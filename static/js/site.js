const cart = [];
const drawer = document.querySelector('.cart-drawer');
const overlay = document.querySelector('.drawer-overlay');
const cartItems = document.querySelector('#cart-items');
const cartCount = document.querySelector('#cart-count');
const cartTotal = document.querySelector('#cart-total');
const floatingCart = document.querySelector('.floating-cart');
const floatingCartCount = document.querySelector('#floating-cart-count');
const toast = document.querySelector('.toast');
const searchPanel = document.querySelector('.search-panel');
const searchToggle = document.querySelector('.search-toggle');
const searchInput = document.querySelector('#product-search');
const searchResults = document.querySelector('#search-results');
const searchClose = document.querySelector('.search-close');
const productModal = document.querySelector('.product-modal');
let activeProduct = null;
let searchPinned = false;

function openCart() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
}

function renderCart() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalQuantity;
    floatingCartCount.textContent = totalQuantity;
    floatingCart.classList.toggle('has-items', totalQuantity > 0);
    if (!cart.length) {
        cartItems.innerHTML = '<div class="empty-cart"><span>＋</span><p>Tu carrito está esperando<br>una buena idea.</p></div>';
        cartTotal.textContent = 'RD$ 0';
        return;
    }
    cartItems.innerHTML = cart.map((item, index) => `<div class="cart-item"><div class="cart-item-main"><p>${item.name}</p><small>${item.price} por unidad</small><div class="quantity-control"><button type="button" data-cart-action="decrease" data-index="${index}" aria-label="Restar una unidad">−</button><span>${item.quantity}</span><button type="button" data-cart-action="increase" data-index="${index}" aria-label="Agregar una unidad">+</button></div></div><div class="cart-item-side"><strong>RD$ ${(item.unitPrice * item.quantity).toLocaleString('es-DO')}</strong><button type="button" class="remove-item" data-cart-action="remove" data-index="${index}" aria-label="Eliminar ${item.name}">×</button></div></div>`).join('');
    const total = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    cartTotal.textContent = `RD$ ${total.toLocaleString('es-DO')}`;
}

function addToCart(name, price) {
    const unitPrice = Number(price.replace(/[^0-9]/g, ''));
    const existing = cart.find((item) => item.name === name && item.unitPrice === unitPrice);
    if (existing) existing.quantity += 1;
    else cart.push({ name, price, unitPrice, quantity: 1 });
    renderCart();
}

function setupCardQuantities() {
    document.querySelectorAll('.product-buy, .spare-buy').forEach((buyArea) => {
        if (buyArea.querySelector('.card-quantity')) return;
        const addButton = buyArea.querySelector('.add-button');
        if (!addButton) return;
        const quantity = document.createElement('input');
        quantity.className = 'card-quantity';
        quantity.type = 'number';
        quantity.min = '1';
        quantity.max = '99';
        quantity.value = '1';
        quantity.setAttribute('aria-label', `Cantidad de ${addButton.dataset.name}`);
        quantity.addEventListener('click', (event) => event.stopPropagation());
        buyArea.insertBefore(quantity, addButton);
    });
}

setupCardQuantities();

document.querySelectorAll('[data-cart-open]').forEach((button) => button.addEventListener('click', openCart));
document.querySelectorAll('[data-cart-close]').forEach((button) => button.addEventListener('click', closeCart));
window.addEventListener('scroll', () => {
    floatingCart.classList.toggle('is-visible', window.scrollY > 260);
}, { passive: true });
document.querySelectorAll('.add-button').forEach((button) => button.addEventListener('click', () => {
    const quantityInput = button.parentElement.querySelector('.card-quantity');
    const quantity = Math.max(1, Math.min(99, Number(quantityInput?.value) || 1));
    for (let index = 0; index < quantity; index += 1) addToCart(button.dataset.name, button.dataset.price);
    if (quantityInput) quantityInput.value = '1';
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 1800);
}));
cartItems.addEventListener('click', (event) => {
    const control = event.target.closest('[data-cart-action]');
    if (!control) return;
    const item = cart[Number(control.dataset.index)];
    if (!item) return;
    if (control.dataset.cartAction === 'increase') item.quantity += 1;
    if (control.dataset.cartAction === 'decrease') item.quantity -= 1;
    if (control.dataset.cartAction === 'remove' || item.quantity <= 0) cart.splice(Number(control.dataset.index), 1);
    renderCart();
});

function setSearchOpen(isOpen, focusInput = false) {
    searchPanel.classList.toggle('is-open', isOpen);
    searchPanel.setAttribute('aria-hidden', String(!isOpen));
    searchToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen && focusInput) window.setTimeout(() => searchInput.focus(), 120);
}

function toggleSearch() {
    searchPinned = !searchPinned;
    setSearchOpen(searchPinned, searchPinned);
}

function normalizeSearchText(value) {
    return value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function applySearch() {
    const query = normalizeSearchText(searchInput.value.trim());
    const matches = [];
    document.querySelectorAll('.product-card, .spare-card').forEach((card) => {
        const searchableText = card.dataset.search || card.innerText;
        const matchesQuery = !query || normalizeSearchText(searchableText).includes(query);
        card.hidden = Boolean(query) && !matchesQuery;
        if (query && matchesQuery && !matches.some((item) => item.dataset.code === card.dataset.code)) matches.push(card);
    });
    renderSearchResults(matches, query);
}

function renderSearchResults(matches, query) {
    searchResults.replaceChildren();
    if (!query) {
        searchResults.classList.remove('has-results');
        return;
    }
    if (!matches.length) {
        searchResults.innerHTML = '<p class="no-results">No encontramos coincidencias. Prueba con otro material, color o pieza.</p>';
        searchResults.classList.add('has-results');
        return;
    }
    matches.slice(0, 5).forEach((card) => {
        const result = document.createElement('button');
        result.className = 'search-result';
        result.type = 'button';
        const name = card.dataset.name || card.querySelector('h3')?.textContent || 'Producto Filan';
        const price = card.dataset.price || card.querySelector('strong')?.textContent || '';
        const material = card.dataset.material || 'Pieza de máquina';
        const color = card.dataset.color || 'Variado';
        const code = card.dataset.code || 'FILAN';
        result.innerHTML = `<span class="search-result-swatch"></span><span><strong>${name}</strong><small>${material} · ${color} · ${code}</small></span><b>${price}</b>`;
        result.addEventListener('click', () => {
            searchPinned = false;
            setSearchOpen(false);
            openProductModal(card);
        });
        searchResults.append(result);
    });
    searchResults.classList.add('has-results');
}

function openProductModal(card) {
    activeProduct = card.dataset;
    document.querySelector('#modal-name').textContent = activeProduct.name;
    document.querySelector('#modal-type').textContent = activeProduct.type === 'REPUESTOS' ? 'REPUESTO PARA IMPRESORA 3D' : activeProduct.type;
    document.querySelector('#modal-description').textContent = activeProduct.description;
    document.querySelector('#modal-material').textContent = activeProduct.material || 'Filan';
    document.querySelector('#modal-color').textContent = activeProduct.color || 'Variado';
    document.querySelector('#modal-code').textContent = activeProduct.code;
    document.querySelector('#modal-stock').textContent = activeProduct.stock;
    document.querySelector('#modal-price').textContent = activeProduct.price;
    const modalVisual = document.querySelector('#modal-visual');
    const tone = card.querySelector('.product-visual, .spare-visual')?.className.match(/tone-([\w-]+)/)?.[1] || 'teal';
    modalVisual.className = `modal-visual tone-${tone}${activeProduct.image ? ' has-image' : ''}`;
    modalVisual.innerHTML = activeProduct.image ? `<img src="${activeProduct.image}" alt="${activeProduct.name}">` : '<div class="modal-placeholder"><span>FILAN</span><small>PRODUCTO 3D</small></div>';
    productModal.classList.add('is-open');
    productModal.setAttribute('aria-hidden', 'false');
}

function closeProductModal() {
    productModal.classList.remove('is-open');
    productModal.setAttribute('aria-hidden', 'true');
    activeProduct = null;
}

searchToggle.addEventListener('click', toggleSearch);
searchInput.addEventListener('input', applySearch);
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        applySearch();
    }
});
searchClose.addEventListener('click', () => {
    searchPinned = false;
    searchInput.value = '';
    applySearch();
    setSearchOpen(false);
});
document.querySelectorAll('.product-card, .spare-card').forEach((card) => card.addEventListener('click', (event) => {
    if (!event.target.closest('.add-button')) openProductModal(card);
}));
document.querySelectorAll('[data-modal-close]').forEach((button) => button.addEventListener('click', closeProductModal));
document.querySelector('#modal-add').addEventListener('click', () => {
    if (!activeProduct) return;
    addToCart(activeProduct.name, activeProduct.price);
    closeProductModal();
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 1800);
});
document.querySelectorAll('.filter').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.product-card').forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.type !== filter;
    });
}));
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
    if (event.key === 'Escape') closeProductModal();
});