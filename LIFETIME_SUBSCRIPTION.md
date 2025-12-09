# Suscripción Lifetime - Guía de Uso

## Descripción

La suscripción **Lifetime** es un plan especial gratuito de por vida que solo está disponible para usuarios seleccionados. Este plan no es visible por defecto y requiere acceso especial.

## ¿Cómo funciona?

### Método 1: Código en URL (Recomendado)

Los usuarios con acceso especial pueden usar un código en la URL para ver el plan lifetime:

```
https://tu-dominio.com/business/subscription?code=LIFETIME2024
```

**Ventajas:**

- Simple y directo
- Fácil de compartir
- No requiere cambios en la base de datos

**Cambiar el código:**
Para cambiar el código, edita el archivo `src/pages/BusinessSubscription.jsx` en la línea donde dice:

```javascript
const hasLifetimeAccess = showLifetimeParam || lifetimeCode === "LIFETIME2024";
```

### Método 2: Parámetro show_lifetime

También puedes usar el parámetro simple:

```
https://tu-dominio.com/business/subscription?show_lifetime=true
```

### Método 3: Verificación por Backend (Avanzado)

Para mayor seguridad, puedes verificar en el backend si el usuario es elegible:

1. Agrega un campo en la tabla de usuarios: `isLifetimeEligible`
2. Modifica `BusinessSubscription.jsx`:

```javascript
const [isEligible, setIsEligible] = useState(false);

useEffect(() => {
  const checkEligibility = async () => {
    try {
      const user = await authService.getCurrentUser();
      setIsEligible(user.isLifetimeEligible);
    } catch (error) {
      console.error("Error checking eligibility:", error);
    }
  };
  checkEligibility();
}, []);

const hasLifetimeAccess =
  showLifetimeParam || lifetimeCode === "LIFETIME2024" || isEligible;
```

## Características del Plan Lifetime

- ✅ **Precio**: GRATIS (valor estimado: $54,000 MXN en 10 años)
- ✅ **Duración**: De por vida
- ✅ **Características**: Todas las del plan anual + beneficios exclusivos
- ✅ **Diseño especial**: Tarjeta con gradiente púrpura/rosa/naranja
- ✅ **Badge**: "Exclusivo"

## Cómo dar acceso a un usuario

### Opción A: Compartir enlace con código

1. Envía al usuario el enlace: `https://tu-app.com/business/subscription?code=LIFETIME2024`
2. El usuario verá automáticamente el plan lifetime
3. Al hacer clic en "Activar Acceso Lifetime", se activará su suscripción

### Opción B: Marcar en base de datos (requiere implementación backend)

1. En tu panel de administración, marca al usuario como elegible
2. El usuario verá el plan lifetime automáticamente al acceder

## Configuración Backend Requerida

El backend debe tener un endpoint para activar la suscripción lifetime:

```javascript
POST / api / subscription / activate - lifetime;
Body: {
  code: "LIFETIME2024";
}

// Verificar el código y activar la suscripción
// Respuesta: { success: true, subscription: { status: 'active', plan: 'lifetime' } }
```

## Seguridad

### Recomendaciones:

1. **Cambiar el código regularmente**

   - Usa códigos únicos por usuario o campaña
   - Ejemplo: `LIFETIME-USER123`, `FOUNDER2024`, etc.

2. **Limitar activaciones**

   - El backend debe validar que el código no se haya usado excesivamente
   - Implementar rate limiting

3. **Códigos de un solo uso**

   ```javascript
   // En el backend
   const validateCode = async (code, userId) => {
     const codeRecord = await LifetimeCode.findOne({ code });
     if (!codeRecord || codeRecord.used) {
       throw new Error("Código inválido o ya usado");
     }
     // Marcar como usado
     codeRecord.used = true;
     codeRecord.usedBy = userId;
     codeRecord.usedAt = new Date();
     await codeRecord.save();
   };
   ```

4. **Verificación de email específicos**

   ```javascript
   // Permitir solo a emails específicos
   const lifetimeEmails = ["usuario1@ejemplo.com", "usuario2@ejemplo.com"];

   const hasLifetimeAccess =
     lifetimeEmails.includes(user.email) || lifetimeCode === "LIFETIME2024";
   ```

## Casos de Uso

### 1. Early Adopters / Fundadores

Recompensa a los primeros usuarios con acceso lifetime:

```
?code=FOUNDER2024
```

### 2. Partners / Colaboradores

Dar acceso a partners o colaboradores estratégicos:

```
?code=PARTNER-XXXX
```

### 3. Promociones Especiales

Campañas de marketing limitadas:

```
?code=PROMO-LAUNCH
```

### 4. Equipo Interno / Testing

Para tu equipo o testers:

```
?code=TEAM-INTERNAL
```

## Modificar el diseño

El plan lifetime tiene un diseño especial con gradiente. Para modificarlo, edita en `BusinessSubscription.jsx`:

```javascript
className={`relative rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
    plan.special
        ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 ring-4 ring-purple-400'
        : 'bg-white'
}`}
```

Puedes cambiar los colores del gradiente:

- `from-purple-600` → Color inicial
- `via-pink-500` → Color medio
- `to-orange-400` → Color final

## Monitoreo

Recomendaciones para monitorear el uso:

1. **Logs en el backend**

   - Registra cada activación de lifetime
   - Guarda: userId, código usado, timestamp, IP

2. **Dashboard de administración**

   - Lista de usuarios con suscripción lifetime
   - Fecha de activación
   - Código usado

3. **Métricas**
   - Número total de suscripciones lifetime activas
   - Tasa de conversión por código
   - Códigos más usados

## Preguntas Frecuentes

**P: ¿Los usuarios pueden ver el plan lifetime sin el código?**
R: No, es completamente invisible sin acceso especial.

**P: ¿Puedo tener múltiples códigos activos?**
R: Sí, puedes agregar múltiples códigos en la validación:

```javascript
const validCodes = ["LIFETIME2024", "FOUNDER", "VIP2024"];
const hasLifetimeAccess = validCodes.includes(lifetimeCode);
```

**P: ¿Cómo revoco el acceso lifetime de un usuario?**
R: Desde el backend, cambia el status de su suscripción o elimina el flag `isLifetimeEligible`.

**P: ¿El plan lifetime aparece en los reportes?**
R: Sí, debe aparecer como un tipo de suscripción diferente en tus reportes y analytics.

## Ejemplo de Implementación Completa

### Frontend (ya implementado)

✅ Detección de código en URL
✅ Renderizado condicional del plan
✅ Diseño especial para lifetime
✅ Activación sin pago

### Backend (necesitas implementar)

```javascript
// routes/subscription.js
router.post("/activate-lifetime", authenticate, async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  // Validar código
  const validCodes = process.env.LIFETIME_CODES?.split(",") || [];
  if (!validCodes.includes(code)) {
    return res.status(400).json({ error: "Código inválido" });
  }

  // Verificar si ya tiene suscripción lifetime
  const existingSubscription = await Subscription.findOne({
    businessId: userId,
    plan: "lifetime",
  });

  if (existingSubscription) {
    return res
      .status(400)
      .json({ error: "Ya tienes una suscripción lifetime" });
  }

  // Crear suscripción lifetime
  const subscription = await Subscription.create({
    businessId: userId,
    plan: "lifetime",
    status: "active",
    startDate: new Date(),
    code: code,
  });

  // Log de activación
  await LifetimeLog.create({
    userId,
    code,
    activatedAt: new Date(),
    ip: req.ip,
  });

  res.json({
    success: true,
    subscription,
  });
});
```

## Soporte

Si tienes dudas sobre la implementación, revisa:

- `src/pages/BusinessSubscription.jsx` - Componente principal
- `src/services/subscriptionService.js` - Servicio de API
- `SUBSCRIPTION_SETUP.md` - Documentación general de suscripciones
