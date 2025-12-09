# Sistema de Suscripciones con Stripe - RewardsHub

## Descripción General

Este módulo implementa un sistema de suscripciones para negocios utilizando Stripe como procesador de pagos. Los clientes no requieren suscripción.

## Estructura de Archivos

### Servicios

- **`src/services/subscriptionService.js`**: Servicio para gestionar las suscripciones
  - `getSubscriptionStatus()`: Obtiene el estado actual de la suscripción
  - `createCheckoutSession(priceId, plan)`: Crea una sesión de pago en Stripe
  - `getPlans()`: Obtiene los planes disponibles
  - `cancelSubscription()`: Cancela la suscripción actual
  - `verifySubscription()`: Verifica el pago después de completar el checkout

### Componentes

- **`src/components/BusinessProtectedRoute.jsx`**: Componente de ruta protegida que verifica:
  1. Si el usuario está autenticado
  2. Si el usuario es de tipo "business"
  3. Si la suscripción está activa
  4. Redirige a `/business/subscription` si el estado es "inactive" o "cancelled"

### Páginas

- **`src/pages/BusinessSubscription.jsx`**: Página de selección de planes
  - Muestra dos planes: Mensual ($500 MXN) y Anual ($4,500 MXN)
  - Integración con Stripe Checkout
  - Manejo de estados de pago (success, cancelled)
  - Verificación post-pago

## Flujo de Funcionamiento

### 1. Registro de Negocio

```
Usuario completa registro → Login automático → BusinessProtectedRoute
→ Verifica suscripción → Redirige a /business/subscription
```

### 2. Inicio de Sesión de Negocio

```
Usuario inicia sesión → Intenta acceder a /business/dashboard
→ BusinessProtectedRoute verifica suscripción
→ Si inactive/cancelled: redirige a /business/subscription
→ Si active: permite acceso al dashboard
```

### 3. Proceso de Pago

```
Usuario selecciona plan → createCheckoutSession()
→ Redirige a Stripe Checkout → Usuario completa pago
→ Stripe redirige de vuelta con session_id
→ verifySubscription() confirma el pago
→ Redirige a /business/dashboard
```

## Estados de Suscripción

- **`active`**: Suscripción activa, acceso completo al dashboard
- **`inactive`**: Sin suscripción, debe seleccionar un plan
- **`cancelled`**: Suscripción cancelada, debe renovar
- **`past_due`**: Pago pendiente (configurable según necesidades)
- **`trialing`**: En período de prueba (si se implementa)

## Planes Disponibles

### Plan Mensual

- **Precio**: $500 MXN/mes
- **ID**: `monthly`
- Características completas del sistema
- Facturación mensual

### Plan Anual

- **Precio**: $4,500 MXN/año
- **ID**: `annual`
- 25% de descuento (equivalente a 2 meses gratis)
- $375 MXN por mes
- Características premium adicionales

### Plan Lifetime (Especial)

- **Precio**: GRATIS (solo para usuarios seleccionados)
- **ID**: `lifetime`
- Acceso de por vida sin pagos
- No visible por defecto
- Requiere código especial en URL: `?code=LIFETIME2024`
- Ver documentación completa en `LIFETIME_SUBSCRIPTION.md`

## Configuración Backend Requerida

El backend debe implementar los siguientes endpoints:

```
GET  /api/subscription/status          - Obtener estado de suscripción
POST /api/subscription/create-checkout-session - Crear sesión de Stripe
GET  /api/subscription/plans           - Obtener planes disponibles
POST /api/subscription/cancel          - Cancelar suscripción
GET  /api/subscription/verify          - Verificar pago completado
```

## Variables de Entorno

Asegúrate de tener configuradas en el backend:

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173 (o tu URL de producción)
```

## URLs de Retorno de Stripe

El sistema está configurado para manejar estas URLs:

- **Success**: `/business/subscription?session_id={CHECKOUT_SESSION_ID}&status=success`
- **Cancel**: `/business/subscription?status=cancelled`

## Seguridad

- ✅ Todas las rutas de negocio están protegidas con `BusinessProtectedRoute`
- ✅ Verificación de autenticación antes de verificar suscripción
- ✅ Validación del tipo de usuario (business vs client)
- ✅ Los clientes no pueden acceder a rutas de negocio
- ✅ Pagos procesados de forma segura por Stripe

## Testing

Para probar el sistema:

1. Usa las tarjetas de prueba de Stripe:
   - **Éxito**: 4242 4242 4242 4242
   - **Rechazada**: 4000 0000 0000 0002
2. Cualquier fecha futura y CVC de 3 dígitos

## Notas Importantes

- Los clientes NO necesitan suscripción y no verán la página de suscripciones
- Un negocio no puede acceder al dashboard sin una suscripción activa
- La verificación de suscripción ocurre en cada navegación a rutas protegidas
- El estado de suscripción se verifica del lado del servidor para mayor seguridad
