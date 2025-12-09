# 🎁 Generador de Enlaces Lifetime

## Enlaces Rápidos

Copia y pega estos enlaces para dar acceso lifetime a usuarios específicos:

### Desarrollo (localhost)

```
http://localhost:5173/business/subscription?code=LIFETIME2024
```

### Producción

```
https://tu-dominio.com/business/subscription?code=LIFETIME2024
```

---

## 📋 Plantilla de Email

Usa esta plantilla para enviar el acceso lifetime a usuarios:

```
Asunto: 🎉 ¡Has sido seleccionado para acceso Lifetime de RewardsHub!

Hola [Nombre],

¡Felicidades! Has sido seleccionado para recibir acceso GRATUITO de por vida a RewardsHub Business.

Este es un beneficio exclusivo valorado en más de $54,000 MXN que te da acceso completo e ilimitado a todas las funcionalidades de nuestra plataforma, ¡para siempre!

🔗 Activa tu acceso aquí:
[ENLACE CON CÓDIGO]

✨ Lo que obtienes:
• Acceso de por vida sin pagos mensuales ni anuales
• Todas las funcionalidades premium
• Actualizaciones futuras incluidas
• Soporte prioritario VIP
• Insignia de miembro fundador

⏰ Este enlace es único y personal. Actívalo cuanto antes para asegurar tu acceso lifetime.

¿Dudas? Responde a este email y con gusto te ayudamos.

¡Bienvenido a RewardsHub!

El equipo de RewardsHub
```

---

## 🎯 Casos de Uso y Códigos Sugeridos

### Para Early Adopters / Fundadores

```
?code=FOUNDER2024
```

### Para Partners

```
?code=PARTNER-2024
```

### Para Influencers/Promotores

```
?code=INFLUENCER-[NOMBRE]
```

### Para Eventos Especiales

```
?code=EVENT-[NOMBRE]
```

### Para Equipo/Testing

```
?code=TEAM-INTERNAL
```

---

## 🔧 Cómo Cambiar los Códigos

1. Abre: `src/pages/BusinessSubscription.jsx`

2. Busca esta línea:

```javascript
const hasLifetimeAccess = showLifetimeParam || lifetimeCode === "LIFETIME2024";
```

3. Modifica según tus necesidades:

**Un solo código:**

```javascript
const hasLifetimeAccess = lifetimeCode === "NUEVO-CODIGO";
```

**Múltiples códigos:**

```javascript
const validCodes = ["FOUNDER2024", "PARTNER2024", "VIP2024"];
const hasLifetimeAccess = validCodes.includes(lifetimeCode);
```

**Códigos con expiración (requiere más lógica):**

```javascript
const codesWithExpiry = {
  PROMO2024: new Date("2024-12-31"),
  LAUNCH: new Date("2024-06-30"),
};

const isCodeValid = (code) => {
  const expiry = codesWithExpiry[code];
  if (!expiry) return false;
  return new Date() <= expiry;
};

const hasLifetimeAccess = lifetimeCode && isCodeValid(lifetimeCode);
```

---

## 📊 Tracking y Monitoreo

### Script de SQL para ver usuarios lifetime (backend)

```sql
-- Ver todos los usuarios con suscripción lifetime
SELECT
    u.id,
    u.email,
    u.name,
    s.plan,
    s.status,
    s.code,
    s.createdAt
FROM users u
JOIN subscriptions s ON s.businessId = u.id
WHERE s.plan = 'lifetime'
ORDER BY s.createdAt DESC;

-- Contar por código usado
SELECT
    code,
    COUNT(*) as count,
    MIN(createdAt) as first_used,
    MAX(createdAt) as last_used
FROM subscriptions
WHERE plan = 'lifetime'
GROUP BY code
ORDER BY count DESC;
```

---

## ⚠️ Advertencias de Seguridad

1. **Nunca publiques los códigos en lugares públicos**

   - No los incluyas en el código fuente público de GitHub
   - Usa variables de entorno para producción

2. **Limita el uso de cada código**

   - Implementa límites en el backend
   - Considera códigos de un solo uso

3. **Monitorea el uso**

   - Revisa regularmente quién está usando los códigos
   - Detecta posibles abusos

4. **Rota los códigos periódicamente**
   - Cambia los códigos cada cierto tiempo
   - Invalida códigos antiguos

---

## 🚀 Tips para Dar Acceso Lifetime

### Para Beta Testers

"Gracias por ayudarnos a mejorar. Aquí está tu acceso lifetime..."

### Para Primeros 100 Usuarios

"¡Eres uno de nuestros primeros 100 usuarios! Como agradecimiento..."

### Para Partners Estratégicos

"Como parte de nuestra alianza, te damos acceso lifetime..."

### Para Ganadores de Concursos

"¡Felicidades por ganar! Tu premio incluye acceso lifetime..."

### Para Empleados/Familia

"Como parte del equipo/familia, tienes acceso lifetime..."

---

## 📝 Checklist de Implementación

Backend:

- [ ] Endpoint para activar lifetime
- [ ] Validación de códigos
- [ ] Límites de uso por código
- [ ] Logging de activaciones
- [ ] Dashboard de administración

Frontend:

- [x] Detección de código en URL
- [x] Renderizado del plan lifetime
- [x] Diseño especial
- [x] Flujo de activación

Documentación:

- [x] Guía de uso
- [x] Plantillas de email
- [x] Ejemplos de códigos

Marketing:

- [ ] Estrategia de quién recibe acceso
- [ ] Plantillas de comunicación
- [ ] Términos y condiciones

---

## 🎨 Personalización del Diseño

El plan lifetime tiene un gradiente especial. Puedes personalizarlo:

### Cambiar colores del gradiente

```javascript
// Actual: púrpura → rosa → naranja
from-purple-600 via-pink-500 to-orange-400

// Alternativas:
// Azul → cian → verde
from-blue-600 via-cyan-500 to-green-400

// Dorado premium
from-yellow-500 via-amber-500 to-orange-500

// Oscuro elegante
from-gray-800 via-gray-700 to-gray-900
```

### Cambiar el badge

```javascript
badge: 'Exclusivo',  // Actual

// Alternativas:
badge: 'Fundador',
badge: 'VIP',
badge: 'Lifetime',
badge: 'Premium',
```

---

## 📞 Soporte

¿Necesitas ayuda con la implementación?

1. Revisa `LIFETIME_SUBSCRIPTION.md` para documentación completa
2. Revisa `SUBSCRIPTION_SETUP.md` para documentación general
3. Revisa el código en `src/pages/BusinessSubscription.jsx`
