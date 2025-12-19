# 🔍 Guía de Debugging: Problema de Auto-Verificación

## ⚠️ Problema Identificado

El campo `isVerified` está cambiando a `true` automáticamente sin que el usuario haga clic en el enlace de verificación del correo electrónico.

---

## 📊 Logs de Debugging Agregados

He agregado logs detallados en los siguientes archivos para ayudarte a diagnosticar el problema:

### 1. **SignUpClient.jsx**
```javascript
console.log('⚠️ DEBUG - isVerified al registrarse:', response.user?.isVerified);
```

### 2. **SignUpBusiness.jsx**
```javascript
console.log('⚠️ DEBUG - isVerified al registrarse (business):', response.user?.isVerified || response.business?.isVerified);
```

### 3. **Login.jsx**
```javascript
console.log('⚠️ DEBUG - Usuario completo:', user);
console.log('⚠️ DEBUG - isVerified al hacer login:', user?.isVerified);
```

### 4. **VerifyPending.jsx**
```javascript
console.log('🔄 Polling - Verificando estado de verificación...');
console.log('📊 Polling - Datos del usuario:', userData);
console.log('✅ Polling - isVerified:', userData.isVerified);
console.log('🎉 ¡Usuario verificado! Redirigiendo...');
console.log('⏳ Usuario aún no verificado, esperando...');
```

---

## 🧪 Pasos para Diagnosticar el Problema

### **Paso 1: Limpiar la Base de Datos**
Antes de hacer las pruebas, elimina cualquier usuario de prueba anterior:

```sql
-- PostgreSQL
DELETE FROM users WHERE email = 'tu-email-de-prueba@ejemplo.com';
DELETE FROM businesses WHERE email = 'tu-email-de-prueba@ejemplo.com';

-- MongoDB
db.users.deleteMany({ email: 'tu-email-de-prueba@ejemplo.com' });
db.businesses.deleteMany({ email: 'tu-email-de-prueba@ejemplo.com' });
```

---

### **Paso 2: Abrir DevTools**
1. Abre tu navegador
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Ve también a la pestaña **Network**

---

### **Paso 3: Registrar un Nuevo Usuario**

#### **Opción A: Registrar Cliente**
1. Ve a `/signup/client`
2. Completa el formulario con un email de prueba
3. Haz clic en "Crear Cuenta de Cliente"

#### **Opción B: Registrar Negocio**
1. Ve a `/signup/business`
2. Completa el formulario con un email de prueba
3. Haz clic en "Crear Cuenta de Negocio"

---

### **Paso 4: Revisar los Logs en la Console**

Busca estos mensajes en la consola:

```
⚠️ DEBUG - isVerified al registrarse: true/false
```

**Pregunta Clave:** ¿Qué valor tiene `isVerified`?

- ✅ **Si es `false`**: El backend está funcionando correctamente
- ❌ **Si es `true`**: El problema está en el backend (ver sección "Soluciones Backend")

---

### **Paso 5: Revisar la Respuesta del Backend en Network**

1. En DevTools, ve a la pestaña **Network**
2. Busca la petición `register` (puede ser `/auth/register` o `/business/register`)
3. Haz clic en ella
4. Ve a la pestaña **Response**
5. Busca el campo `isVerified` en la respuesta JSON

**Ejemplo de respuesta:**
```json
{
  "user": {
    "id": "123",
    "email": "test@ejemplo.com",
    "isVerified": false,  // ← ¿Qué valor tiene aquí?
    "createdAt": "2025-12-18T..."
  },
  "accessToken": "eyJhbGc..."
}
```

---

### **Paso 6: Observar el Polling en /verify-pending**

Después del registro, deberías ser redirigido a `/verify-pending`.

En la consola, deberías ver cada 3 segundos:

```
🔄 Polling - Verificando estado de verificación...
📊 Polling - Datos del usuario: { id: "123", email: "...", isVerified: false }
✅ Polling - isVerified: false
⏳ Usuario aún no verificado, esperando...
```

**Observa:**
- ¿Cuánto tiempo pasa antes de que `isVerified` cambie a `true`?
- ¿Cambia inmediatamente o después de varios segundos?
- ¿Cambia sin que hayas hecho clic en el enlace del correo?

---

### **Paso 7: Revisar la Base de Datos Directamente**

Mientras estás en `/verify-pending`, abre tu base de datos y ejecuta:

```sql
-- PostgreSQL
SELECT id, email, "isVerified", "createdAt", "updatedAt" 
FROM users 
WHERE email = 'tu-email-de-prueba@ejemplo.com';

-- MongoDB
db.users.find({ email: 'tu-email-de-prueba@ejemplo.com' })
```

**Observa:**
- ¿Qué valor tiene `isVerified` en la base de datos?
- ¿Cambia con el tiempo sin que hagas nada?

---

## 🔧 Posibles Causas y Soluciones

### **Causa 1: Backend en Modo Desarrollo (MÁS PROBABLE)**

#### **Síntoma:**
`isVerified` viene como `true` inmediatamente al registrarse.

#### **Solución:**
Revisa tu backend en estos archivos:

**1. `.env` del backend:**
```bash
# ❌ INCORRECTO
AUTO_VERIFY_USERS=true
SKIP_EMAIL_VERIFICATION=true
NODE_ENV=development

# ✅ CORRECTO
AUTO_VERIFY_USERS=false
SKIP_EMAIL_VERIFICATION=false
# O simplemente elimina/comenta estas líneas
```

**2. `auth.controller.ts` o `business.controller.ts`:**
```typescript
// ❌ INCORRECTO - Busca y elimina esto
if (process.env.NODE_ENV === 'development') {
  user.isVerified = true;
}

// ❌ INCORRECTO - Busca y elimina esto
const user = await this.userService.create({
  ...userData,
  isVerified: true  // ← Debe ser false
});

// ✅ CORRECTO
const user = await this.userService.create({
  ...userData,
  isVerified: false  // ← Correcto
});
```

**3. `user.model.ts` o `business.model.ts`:**
```typescript
// ❌ INCORRECTO
@Column({ default: true })
isVerified: boolean;

// ✅ CORRECTO
@Column({ default: false })
isVerified: boolean;
```

---

### **Causa 2: Endpoint de Verificación Auto-Ejecutándose**

#### **Síntoma:**
`isVerified` cambia a `true` después de unos segundos/minutos sin hacer clic en el enlace.

#### **Solución:**
Revisa si hay algún código en el backend que esté verificando automáticamente:

**1. Busca en `auth.service.ts` o `user.service.ts`:**
```typescript
// ❌ INCORRECTO - Elimina esto si existe
async autoVerifyAfterDelay(userId: string) {
  setTimeout(async () => {
    await this.userRepository.update(userId, { isVerified: true });
  }, 10000); // Auto-verifica después de 10 segundos
}
```

**2. Busca en `auth.controller.ts`:**
```typescript
// ❌ INCORRECTO - Elimina esto si existe
@Post('register')
async register(@Body() userData: CreateUserDto) {
  const user = await this.authService.register(userData);
  
  // Auto-verificar después de un tiempo (INCORRECTO)
  this.autoVerifyAfterDelay(user.id);
  
  return user;
}
```

---

### **Causa 3: Token de Verificación Inválido o Sin Expiración**

#### **Síntoma:**
El token de verificación no se está generando correctamente.

#### **Solución:**
Revisa el servicio de email en el backend:

**`email.service.ts`:**
```typescript
// ✅ CORRECTO - Debe generar un token único
async sendVerificationEmail(user: User) {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Guardar el token en la base de datos
  await this.userRepository.update(user.id, {
    verificationToken,
    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
  });
  
  const verificationUrl = `${process.env.FRONTEND_URL}/user/verify-email?token=${verificationToken}`;
  
  // Enviar email con el link
  await this.mailer.sendMail({
    to: user.email,
    subject: 'Verifica tu cuenta',
    html: `<a href="${verificationUrl}">Haz clic aquí para verificar</a>`
  });
}
```

---

### **Causa 4: Middleware o Interceptor Modificando isVerified**

#### **Síntoma:**
`isVerified` cambia en algún punto del flujo de la petición.

#### **Solución:**
Revisa si hay middleware que esté modificando el usuario:

**`auth.middleware.ts`:**
```typescript
// ❌ INCORRECTO - Elimina esto si existe
export function autoVerifyMiddleware(req, res, next) {
  if (req.user && !req.user.isVerified) {
    req.user.isVerified = true; // ← Esto está mal
  }
  next();
}
```

---

## 📋 Checklist de Verificación del Backend

Revisa estos puntos en tu backend:

- [ ] `.env` no tiene `AUTO_VERIFY_USERS=true`
- [ ] `.env` no tiene `SKIP_EMAIL_VERIFICATION=true`
- [ ] `user.model.ts` tiene `@Column({ default: false })` para `isVerified`
- [ ] `business.model.ts` tiene `@Column({ default: false })` para `isVerified`
- [ ] `auth.controller.ts` no establece `isVerified: true` al registrar
- [ ] `business.controller.ts` no establece `isVerified: true` al registrar
- [ ] No hay código que auto-verifique después de un tiempo
- [ ] No hay middleware que modifique `isVerified`
- [ ] El token de verificación se genera correctamente
- [ ] El email se envía correctamente con el link de verificación

---

## 🎯 Resultado Esperado

Después de corregir el backend, deberías ver:

### **Al Registrarse:**
```
⚠️ DEBUG - isVerified al registrarse: false  ← Debe ser false
```

### **En /verify-pending (Polling cada 3 segundos):**
```
🔄 Polling - Verificando estado de verificación...
📊 Polling - Datos del usuario: { ..., isVerified: false }
✅ Polling - isVerified: false
⏳ Usuario aún no verificado, esperando...
```

### **Después de Hacer Clic en el Enlace del Correo:**
```
🔄 Polling - Verificando estado de verificación...
📊 Polling - Datos del usuario: { ..., isVerified: true }
✅ Polling - isVerified: true
🎉 ¡Usuario verificado! Redirigiendo...
```

---

## 🚀 Próximos Pasos

1. **Ejecuta las pruebas** siguiendo los pasos de esta guía
2. **Anota los resultados** de los logs en la consola
3. **Revisa el backend** según la causa identificada
4. **Corrige el problema** en el backend
5. **Prueba nuevamente** para confirmar que funciona

---

## 📞 Información para Reportar

Si necesitas ayuda adicional, proporciona:

1. **Logs de la consola** al registrarte
2. **Respuesta del backend** en la pestaña Network
3. **Valor de `isVerified`** en la base de datos
4. **Tiempo que tarda** en cambiar a `true`
5. **Variables de entorno** del backend (sin datos sensibles)
6. **Fragmentos de código** de los archivos mencionados

---

**Creado por:** Antigravity AI Assistant  
**Fecha:** 2025-12-18  
**Versión:** 1.0
