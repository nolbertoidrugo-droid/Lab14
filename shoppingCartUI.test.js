/**
 * @jest-environment jsdom
 */

const { processCart, calculateCartSummary, renderCartSummaryUI } = require('./shoppingCartUI');

describe('Suite de Pruebas Unitarias - ShoppingCartUI', () => {

    beforeEach(() => {
        document.body.innerHTML = '<div id="cart-summary"></div>';
    });

    describe('1. Happy Path - Cálculo sin cupón', () => {
        it('debe calcular subtotal, IGV (18%) y total correctamente sin descuentos', () => {
            const items = [
                { price: 100, qty: 2 },
                { price: 50, qty: 1 }
            ];
            const result = processCart(items, null, null);

            expect(result.subtotal).toBe(250);
            expect(result.discount).toBe(0);
            expect(result.tax).toBeCloseTo(45, 2);
            expect(result.total).toBeCloseTo(295, 2);
        });
    });

    describe('2. Aplicación de Cupones y Niveles de Usuario', () => {
        it('debe aplicar 10% de descuento con el cupón DESCUENTO10', () => {
            const items = [{ price: 100, qty: 1 }];
            const result = processCart(items, 'DESCUENTO10', 'REGULAR');

            expect(result.subtotal).toBe(100);
            expect(result.discount).toBe(10);
            expect(result.tax).toBeCloseTo(16.20, 2);
            expect(result.total).toBeCloseTo(106.20, 2);
        });

        it('debe aplicar 20% con el cupón VIP20 solo si el usuario es GOLD o PLATINUM', () => {
            const items = [{ price: 200, qty: 1 }];
            const resultGold = processCart(items, 'VIP20', 'GOLD');
            expect(resultGold.discount).toBe(40);

            const resultPlat = processCart(items, 'VIP20', 'PLATINUM');
            expect(resultPlat.discount).toBe(40);

            const resultRegular = processCart(items, 'VIP20', 'SILVER');
            expect(resultRegular.discount).toBe(0);
        });
    });

    describe('3. Casos Límite y Manejo Defensivo', () => {
        it('debe retornar ceros si la lista de ítems está vacía', () => {
            const result = processCart([], null, null);
            expect(result.subtotal).toBe(0);
            expect(result.discount).toBe(0);
            expect(result.total).toBe(0);
        });

        it('debe ignorar ítems con cantidad cero o datos incompletos', () => {
            const items = [
                { price: 50, qty: 0 },
                { price: 100 }
            ];
            const result = processCart(items, null, null);
            expect(result.subtotal).toBe(0);
        });
    });

    describe('4. Manipulación del DOM y Accesibilidad WCAG 2.1', () => {
        it('debe renderizar la caja con semántica accesible y los valores en pantalla', () => {
            const items = [{ price: 100, qty: 1 }];
            processCart(items, null, null);

            const container = document.getElementById('cart-summary');
            expect(container.innerHTML).not.toBe('');
            expect(container.textContent).toContain('Resumen de Compra');
            expect(container.textContent).toContain('Total: S/ 118.00');

            const box = container.querySelector('.summary-box');
            expect(box).not.toBeNull();
            expect(box.getAttribute('role')).toBe('region');
            expect(box.getAttribute('aria-live')).toBe('polite');

            const button = container.querySelector('button');
            expect(button).not.toBeNull();
            expect(button.getAttribute('aria-label')).toBe('Pagar monto total de S/ 118.00');
        });
    });
});
