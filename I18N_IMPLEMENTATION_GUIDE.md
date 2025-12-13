# 🌍 Guía de Implementación i18n en Todas las Páginas

## ✅ Estado Actual

| Página | Estado | Prioridad |
|--------|--------|-----------|
| Login | ✅ Implementado | Alta |
| Landing | 🔄 Pendiente | Alta |
| SignUpChoice | 🔄 Pendiente | Alta |
| SignUpClient | 🔄 Pendiente | Alta |
| SignUpBusiness | 🔄 Pendiente | Alta |
| ForgotPassword | 🔄 Pendiente | Media |
| ResetPassword | 🔄 Pendiente | Media |
| VerifyEmail | 🔄 Pendiente | Media |
| VerifyPending | 🔄 Pendiente | Media |
| ClientHome | 🔄 Pendiente | Baja |
| BusinessHome | 🔄 Pendiente | Baja |

---

## 📝 Pasos para Implementar i18n en Cualquier Página

### **Paso 1: Importar useTranslation y LanguageSwitcher**

```javascript
// Al inicio del archivo
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher'; // Si quieres el selector
```

### **Paso 2: Usar el hook en el componente**

```javascript
function MyPage() {
  const { t } = useTranslation();
  
  // ... resto del código
}
```

### **Paso 3: Agregar LanguageSwitcher (opcional)**

```javascript
return (
  <div>
    {/* Selector de idioma en esquina superior derecha */}
    <div className="absolute top-4 right-4 z-50">
      <LanguageSwitcher />
    </div>
    
    {/* Resto del contenido */}
  </div>
);
```

### **Paso 4: Reemplazar textos hardcodeados**

```javascript
// ❌ Antes (hardcodeado)
<h1>Bienvenido a RewardsHub</h1>
<p>Plataforma de fidelización</p>
<button>Iniciar Sesión</button>

// ✅ Después (traducido)
<h1>{t('landing.title')}</h1>
<p>{t('landing.subtitle')}</p>
<button>{t('common.login')}</button>
```

---

## 🎯 Implementación por Página

### **1. Landing.jsx**

**Textos a traducir:**
- "RewardsHub" (título)
- "Iniciar Sesión" (botón)
- "Registrarse" (botón)
- "Para Negocios" (sección)
- "Para Clientes" (sección)
- Descripciones y CTAs

**Claves de traducción a usar:**
```javascript
{t('landing.title')}
{t('common.login')}
{t('common.signup')}
{t('landing.forBusinesses')}
{t('landing.forClients')}
{t('landing.businessDescription')}
{t('landing.clientDescription')}
```

**Código de ejemplo:**
```javascript
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Landing() {
  const { t } = useTranslation();
  
  return (
    <div>
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      <h1>{t('landing.title')}</h1>
      <p>{t('landing.subtitle')}</p>
      
      <Link to="/login">
        {t('common.login')}
      </Link>
      
      <Link to="/signup">
        {t('common.signup')}
      </Link>
    </div>
  );
}
```

---

### **2. SignUpChoice.jsx**

**Textos a traducir:**
- "Elige tu Tipo de Cuenta"
- "Soy Cliente"
- "Soy Negocio"
- Descripciones

**Claves:**
```javascript
{t('signup.choice.title')}
{t('signup.choice.subtitle')}
{t('signup.choice.client')}
{t('signup.choice.business')}
{t('signup.choice.clientDescription')}
{t('signup.choice.businessDescription')}
```

---

### **3. SignUpClient.jsx**

**Textos a traducir:**
- "Registro de Cliente"
- "Nombre Completo"
- "Correo Electrónico"
- "Contraseña"
- "Confirmar Contraseña"
- "Crear Cuenta"
- "¿Eres un negocio?"

**Claves:**
```javascript
{t('signup.client.title')}
{t('signup.client.subtitle')}
{t('signup.client.fullName')}
{t('common.email')}
{t('common.password')}
{t('common.confirmPassword')}
{t('signup.client.button')}
{t('signup.client.areYouBusiness')}
```

---

### **4. SignUpBusiness.jsx**

**Textos a traducir:**
- "Registro de Negocio"
- "Nombre del Negocio"
- "Categoría"
- "Dirección"
- "Descripción"
- "Crear Cuenta de Negocio"

**Claves:**
```javascript
{t('signup.business.title')}
{t('signup.business.subtitle')}
{t('signup.business.businessName')}
{t('signup.business.category')}
{t('common.address')}
{t('signup.business.description')}
{t('signup.business.button')}
```

---

### **5. ForgotPassword.jsx**

**Textos a traducir:**
- "Recuperar Contraseña"
- "Ingresa tu correo"
- "Enviar enlace"

**Claves:**
```javascript
{t('common.forgotPassword')}
{t('common.email')}
// Agregar nuevas claves si es necesario
```

---

### **6. ResetPassword.jsx**

**Textos a traducir:**
- "Restablecer Contraseña"
- "Nueva Contraseña"
- "Confirmar Contraseña"
- "Cambiar Contraseña"

**Claves:**
```javascript
{t('common.password')}
{t('common.confirmPassword')}
// Agregar nuevas claves si es necesario
```

---

### **7. VerifyEmail.jsx**

**Textos a traducir:**
- "Verificando..."
- "¡Verificación Exitosa!"
- "Error de Verificación"
- "Ir a Iniciar Sesión"

**Claves:**
```javascript
{t('common.loading')}
{t('common.success')}
{t('common.error')}
{t('common.login')}
```

---

### **8. VerifyPending.jsx**

**Textos a traducir:**
- "Verifica tu correo"
- "Reenviar correo"
- "Cerrar Sesión"

**Claves:**
```javascript
// Agregar nuevas claves en translation.json
```

---

## 🔧 Agregar Nuevas Claves de Traducción

Si necesitas agregar nuevas claves que no existen:

### **En `src/locales/es/translation.json`:**
```json
{
  "forgotPassword": {
    "title": "Recuperar Contraseña",
    "subtitle": "Ingresa tu correo para recuperar tu cuenta",
    "sendLink": "Enviar enlace",
    "emailSent": "Correo enviado exitosamente"
  },
  "resetPassword": {
    "title": "Restablecer Contraseña",
    "subtitle": "Crea una nueva contraseña",
    "newPassword": "Nueva Contraseña",
    "button": "Cambiar Contraseña"
  }
}
```

### **En `src/locales/en/translation.json`:**
```json
{
  "forgotPassword": {
    "title": "Recover Password",
    "subtitle": "Enter your email to recover your account",
    "sendLink": "Send link",
    "emailSent": "Email sent successfully"
  },
  "resetPassword": {
    "title": "Reset Password",
    "subtitle": "Create a new password",
    "newPassword": "New Password",
    "button": "Change Password"
  }
}
```

---

## ✅ Checklist de Implementación

Para cada página:

- [ ] Importar `useTranslation`
- [ ] Importar `LanguageSwitcher` (si aplica)
- [ ] Agregar `const { t } = useTranslation()`
- [ ] Agregar `<LanguageSwitcher />` en la UI
- [ ] Reemplazar todos los textos con `t()`
- [ ] Verificar que todas las claves existen en ES y EN
- [ ] Probar cambio de idioma
- [ ] Commit cambios

---

## 🚀 Orden de Implementación Recomendado

1. ✅ **Login** (Ya hecho)
2. **Landing** (Página principal - Alta prioridad)
3. **SignUpChoice** (Flujo de registro)
4. **SignUpClient** (Flujo de registro)
5. **SignUpBusiness** (Flujo de registro)
6. **ForgotPassword** (Recuperación)
7. **ResetPassword** (Recuperación)
8. **VerifyEmail** (Verificación)
9. **VerifyPending** (Verificación)

---

## 📚 Recursos

- **Traducciones ES:** `src/locales/es/translation.json`
- **Traducciones EN:** `src/locales/en/translation.json`
- **Componente Selector:** `src/components/LanguageSwitcher.jsx`
- **Documentación:** `I18N.md` y `I18N_QUICKSTART.md`

---

**Fecha:** 2025-12-13  
**Versión:** 1.0.0
