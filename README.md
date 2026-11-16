# ShoppingCartUI - Especificación Técnica de Componente Frontend

Módulo modular de interfaz de usuario para el cálculo y renderizado del resumen de compras, refactorizado bajo principios de arquitectura limpia, prevención de inyecciones XSS y directrices de accesibilidad digital **WCAG 2.1**.

---

## 1. Instalación y Ejecución de Pruebas

### Requisitos Previos
- **Node.js**: v18.0.0 o superior
- **Jest**: v29+ / v30+
- **jest-environment-jsdom**: Entorno de simulación DOM

### Instalación de Dependencias
```bash
npm install
```

### Ejecución de la Suite de Pruebas
```bash
npm test
```
o mediante ejecución directa con npx:
```bash
npx jest
```

---

## 2. Arquitectura de Módulos y Separación de Responsabilidades

El componente divide estrictamente la lógica financiera del renderizado en el navegador:

1. **`calculateCartSummary(items, couponCode, userTier)`**
   - **Tipo**: Función pura desacoplada del DOM.
   - **Responsabilidad**: Validación defensiva de tipos, cálculo de subtotales, determinación de cupones (`DESCUENTO10`, `VIP20`), cálculo de IGV (18%) y total.
   - **Retorno**: Objeto `{ subtotal, discount, tax, total }`.

2. **`renderCartSummaryUI(containerId, summaryData)`**
   - **Tipo**: Componente de interfaz DOM API.
   - **Responsabilidad**: Construcción programática de nodos (`document.createElement`) para prevenir inyecciones HTML maliciosas (mitigación XSS). Inyección controlada en el contenedor especificado.
   - **Retorno**: `boolean` (`true` si fue renderizado correctamente).

3. **`processCart(items, couponCode, userTier)`**
   - **Tipo**: Wrapper de orquestación y compatibilidad hacia atrás.
   - **Responsabilidad**: Conectar el cálculo financiero puro con el renderizado dinámico en el DOM bajo el contenedor `#cart-summary`.

---

## 3. Matriz de Atributos de Accesibilidad Digital (WCAG 2.1)

| Elemento UI | Atributo / Técnica WCAG | Criterio de Éxito | Propósito y Beneficio UX |
| :--- | :--- | :--- | :--- |
| Contenedor `.summary-box` | `role="region"` | 1.3.1 Info & Relationships | Permite que lectores de pantalla reconozcan el resumen como un hito estructural navegable. |
| Contenedor `.summary-box` | `aria-live="polite"` | 4.1.3 Status Messages | Notifica de manera no intrusiva a usuarios con discapacidad visual cuando los precios cambian. |
| Contenedor `.summary-box` | `aria-label="Resumen de costos de compra"` | 2.4.6 Headings & Labels | Otorga un nombre accesible inequívoco a la región. |
| Botón de Pago `button` | `aria-label="Pagar monto total de S/ ..."` | 4.1.2 Name, Role, Value | Proporciona contexto auditivo completo del importe que se va a debitar antes de interactuar. |
| Botón de Pago `button` | `type="button"` | 4.1.2 Name, Role, Value | Previene envíos involuntarios de formularios HTML estándar. |

---

## 4. Ejemplo de Integración en el Frontend

```html
<!-- En tu archivo HTML -->
<div id="cart-summary"></div>

<!-- En tu script cliente -->
<script src="./shoppingCartUI.js"></script>
<script>
    const carrito = [
        { price: 120.00, qty: 2 },
        { price: 45.50, qty: 1 }
    ];

    // Cálculo y renderizado automático con cupón VIP
    processCart(carrito, 'VIP20', 'GOLD');
</script>
```
