/**
 * @file shoppingCartUI.js
 * @description Módulo de carrito de compras UI refactorizado con separación de responsabilidades,
 * manipulación segura del DOM (prevención XSS) y estándares de accesibilidad WCAG 2.1.
 */

/**
 * Representa un artículo en el carrito de compras.
 * @typedef {Object} CartItem
 * @property {number} price - Precio unitario del producto.
 * @property {number} qty - Cantidad de unidades a adquirir.
 */

/**
 * Resumen de los importes calculados del carrito.
 * @typedef {Object} CartSummary
 * @property {number} subtotal - Subtotal acumulado antes de descuentos e impuestos.
 * @property {number} discount - Monto del descuento aplicado.
 * @property {number} tax - Impuesto General a las Ventas (IGV 18%).
 * @property {number} total - Importe final a abonar.
 */

/**
 * Función pura que calcula de forma desacoplada los montos financieros del carrito.
 * Incluye validaciones defensivas ante datos incompletos o valores límite.
 *
 * @param {CartItem[]} [items=[]] - Lista de productos en el carrito.
 * @param {string|null} [couponCode=null] - Código de cupón promocional ('DESCUENTO10' | 'VIP20').
 * @param {string|null} [userTier=null] - Nivel del usuario ('GOLD' | 'PLATINUM' | etc.).
 * @returns {CartSummary} Totales calculados (subtotal, descuento, IGV, total).
 */
function calculateCartSummary(items = [], couponCode = null, userTier = null) {
    if (!Array.isArray(items)) {
        return { subtotal: 0, discount: 0, tax: 0, total: 0 };
    }

    let subtotal = 0;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && typeof item.price === 'number' && typeof item.qty === 'number') {
            if (item.price > 0 && item.qty > 0) {
                subtotal += item.price * item.qty;
            }
        }
    }

    let discount = 0;
    if (couponCode === 'DESCUENTO10') {
        discount = subtotal * 0.10;
    } else if (couponCode === 'VIP20') {
        if (userTier === 'GOLD' || userTier === 'PLATINUM') {
            discount = subtotal * 0.20;
        }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.18;
    const total = taxableAmount + tax;

    return { subtotal, discount, tax, total };
}

/**
 * Renderiza de forma segura y accesible el resumen del carrito en el DOM.
 * Aplica estándares WCAG 2.1 (role="region", aria-live="polite", aria-label en botón de pago).
 *
 * @param {string} containerId - ID del contenedor en el DOM donde se inyectará el componente.
 * @param {CartSummary} summaryData - Objeto con los importes calculados.
 * @returns {boolean} True si se renderizó exitosamente, False si no existe el contenedor.
 */
function renderCartSummaryUI(containerId, summaryData) {
    if (typeof document === 'undefined') return false;

    const container = document.getElementById(containerId);
    if (!container) return false;

    // Limpieza segura del contenedor sin usar innerHTML directamente
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Creación segura de la estructura con DOM API (mitigación XSS)
    const box = document.createElement('div');
    box.className = 'summary-box';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Resumen de costos de compra');

    const title = document.createElement('h3');
    title.textContent = 'Resumen de Compra';
    box.appendChild(title);

    const pSubtotal = document.createElement('p');
    pSubtotal.textContent = `Subtotal: S/ ${summaryData.subtotal.toFixed(2)}`;
    box.appendChild(pSubtotal);

    const pDiscount = document.createElement('p');
    pDiscount.textContent = `Descuento: S/ ${summaryData.discount.toFixed(2)}`;
    box.appendChild(pDiscount);

    const pTax = document.createElement('p');
    pTax.textContent = `IGV (18%): S/ ${summaryData.tax.toFixed(2)}`;
    box.appendChild(pTax);

    const hTotal = document.createElement('h4');
    hTotal.textContent = `Total: S/ ${summaryData.total.toFixed(2)}`;
    box.appendChild(hTotal);

    const btn = document.createElement('button');
    btn.textContent = 'Pagar Ahora';
    btn.className = 'btn-checkout';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', `Pagar monto total de S/ ${summaryData.total.toFixed(2)}`);
    btn.addEventListener('click', () => {
        if (typeof window.checkout === 'function') {
            window.checkout();
        }
    });
    box.appendChild(btn);

    container.appendChild(box);
    return true;
}

/**
 * Función wrapper principal para compatibilidad con el código cliente legacy.
 * Orquesta el cálculo puro y el renderizado seguro en la interfaz.
 *
 * @param {CartItem[]} items - Lista de artículos en el carrito.
 * @param {string|null} [couponCode] - Código de descuento.
 * @param {string|null} [userTier] - Nivel de membresía del usuario.
 * @returns {CartSummary} Totales calculados.
 */
function processCart(items, couponCode, userTier) {
    const summary = calculateCartSummary(items, couponCode, userTier);
    renderCartSummaryUI('cart-summary', summary);
    return summary;
}

module.exports = {
    calculateCartSummary,
    renderCartSummaryUI,
    processCart
};
