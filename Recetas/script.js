// Número de WhatsApp: código de país + 9 + código de área + número, sin "+" ni espacios
// +54 9 11 5773-2791  ->  5491157732791
const WHATSAPP_NUMBER = "5491157732791";
const NOMBRE_NEGOCIO = "Dulces Dylisa";

// Estado del carrito
let cart = [];

// Elementos del DOM
const cartItemsContainer = document.getElementById('cart-items');
const cartCountElement = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');
const btnWhatsapp = document.getElementById('btn-whatsapp');
const userNameInput = document.getElementById('user-name');
const userDateInput = document.getElementById('user-date');
const userNotesInput = document.getElementById('user-notes');

// La fecha mínima de entrega es dentro de 2 días (retiro en 48hs)
(function setMinDate() {
    const min = new Date();
    min.setDate(min.getDate() + 2);
    const yyyy = min.getFullYear();
    const mm = String(min.getMonth() + 1).padStart(2, '0');
    const dd = String(min.getDate()).padStart(2, '0');
    userDateInput.min = `${yyyy}-${mm}-${dd}`;
})();

// Botones "Agregar al Carrito"
document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price) || 0;
        // El id se arma con el nombre, así cada producto es único
        // aunque en el HTML haya data-id repetidos.
        const id = name.trim().toLowerCase();
        addToCart(id, name, price);
    });
});

// Agregar producto
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    updateCartUI();
}

// Quitar una unidad del producto (si llega a 0, se elimina)
function removeFromCart(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity -= 1;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
}

// Formatear precios: $12.500
function formatPrice(n) {
    return '$' + n.toLocaleString('es-AR');
}

// Actualizar el carrito en pantalla
function updateCartUI() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-message">Tu carrito está vacío. ¡Agregá algo rico del catálogo!</p>';
        btnWhatsapp.disabled = true;
        cartCountElement.textContent = '0';
        cartTotalElement.textContent = '$0';
        return;
    }

    let total = 0;
    let totalItems = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        totalItems += item.quantity;

        const itemRow = document.createElement('div');
        itemRow.classList.add('cart-item');
        itemRow.innerHTML = `
            <div>
                <strong>${item.name}</strong> x${item.quantity}
                <br><small>${formatPrice(item.price * item.quantity)}</small>
            </div>
            <button class="btn-remove" data-id="${item.id}">Quitar</button>
        `;
        cartItemsContainer.appendChild(itemRow);
    });

    // Eventos de los botones "Quitar"
    cartItemsContainer.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });

    cartCountElement.textContent = totalItems;
    cartTotalElement.textContent = formatPrice(total);
    btnWhatsapp.disabled = false;
}

// Convertir fecha YYYY-MM-DD a DD/MM/YYYY
function formatDate(isoDate) {
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
}

// Enviar pedido por WhatsApp (un solo listener)
btnWhatsapp.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    const date = userDateInput.value;
    const notes = userNotesInput.value.trim();

    if (cart.length === 0) {
        alert("Tu carrito está vacío. Agregá al menos un producto.");
        return;
    }

    if (!name || !date) {
        alert("Por favor, completá tu nombre y la fecha de entrega antes de enviar.");
        return;
    }

    // Armar el mensaje
    let message = `*¡Hola! Me gustaría hacer un pedido a ${NOMBRE_NEGOCIO}* 🍰\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Fecha deseada:* ${formatDate(date)}\n\n`;
    message += `*Detalle del pedido:*\n`;

    let total = 0;
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• ${item.name} (x${item.quantity}) - ${formatPrice(subtotal)}\n`;
    });

    message += `\n*Total estimado:* ${formatPrice(total)}\n`;
    if (notes) {
        message += `\n*Aclaraciones:* ${notes}\n`;
    }
    message += `\nQuedo a la espera de la confirmación de la seña. ¡Muchas gracias!`;

    // Link correcto de WhatsApp: https://wa.me/NUMERO?text=MENSAJE
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
});

// ===== Menú desplegable en celulares =====
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

function setMenu(open) {
    mainNav.classList.toggle('open', open);
    menuToggle.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', open);
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

menuToggle.addEventListener('click', () => {
    setMenu(!mainNav.classList.contains('open'));
});

// Cerrar el menú al tocar un link
mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
});

// Cerrar el menú al tocar fuera de él
document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        setMenu(false);
    }
});










// ===== Carrusel de fotos =====
(function initCarousel() {
    const AUTOPLAY_MS = 4000; // cada cuántos ms pasa solo (0 = desactivado)

    const track = document.getElementById('carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    const btnPrev = document.getElementById('carousel-prev');
    const btnNext = document.getElementById('carousel-next');
    if (!track) return;

    const slides = Array.from(track.children);
    let dots = [];
    let timer = null;

    function stepWidth() {
        return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
    }

    function pageCount() {
        const perView = Math.max(1, Math.round(track.clientWidth / stepWidth()));
        return Math.max(1, slides.length - perView + 1);
    }

    function currentIndex() {
        return Math.min(pageCount() - 1, Math.round(track.scrollLeft / stepWidth()));
    }

    function goTo(i) {
        const max = pageCount() - 1;
        const index = Math.max(0, Math.min(max, i));
        track.scrollTo({ left: index * stepWidth(), behavior: 'smooth' });
    }

    function next() {
        goTo(currentIndex() >= pageCount() - 1 ? 0 : currentIndex() + 1);
    }

    function prev() {
        goTo(currentIndex() <= 0 ? pageCount() - 1 : currentIndex() - 1);
    }

    function buildDots() {
        dotsContainer.innerHTML = '';
        dots = [];
        for (let i = 0; i < pageCount(); i++) {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', 'Ir a la foto ' + (i + 1));
            dot.addEventListener('click', () => { goTo(i); restartAutoplay(); });
            dotsContainer.appendChild(dot);
            dots.push(dot);
        }
        updateDots();
    }

    function updateDots() {
        const active = currentIndex();
        dots.forEach((d, i) => d.classList.toggle('active', i === active));
    }

    function startAutoplay() {
        if (!AUTOPLAY_MS || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        stopAutoplay();
        timer = setInterval(next, AUTOPLAY_MS);
    }

    function stopAutoplay() {
        clearInterval(timer);
        timer = null;
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    btnNext.addEventListener('click', () => { next(); restartAutoplay(); });
    btnPrev.addEventListener('click', () => { prev(); restartAutoplay(); });
    track.addEventListener('scroll', updateDots, { passive: true });

    track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    const carousel = document.getElementById('carousel');
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('touchstart', stopAutoplay, { passive: true });
    carousel.addEventListener('touchend', startAutoplay, { passive: true });

    window.addEventListener('resize', buildDots);

    buildDots();
    startAutoplay();
})();