# 🌍 Guía Rápida de Implementación i18n

## ✅ Ya Implementado

1. ✅ Instaladas dependencias
2. ✅ Configurado i18n con detección automática
3. ✅ Creados archivos de traducción (ES/EN)
4. ✅ Creado componente LanguageSwitcher
5. ✅ Inicializado en main.jsx

---

## 🚀 Cómo Usar en 3 Pasos

### **Paso 1: Importar el hook**
```javascript
import { useTranslation } from 'react-i18next';
```

### **Paso 2: Usar el hook en tu componente**
```javascript
function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('common.welcome')}</h1>;
}
```

### **Paso 3: Agregar el selector de idioma**
```javascript
import LanguageSwitcher from '../components/LanguageSwitcher';

<LanguageSwitcher />
```

---

## 📍 Dónde Agregar el LanguageSwitcher

### **Opción 1: En el Navbar/Header**
```javascript
// src/components/Navbar.jsx
import LanguageSwitcher from './LanguageSwitcher';

function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4">
      <div>Logo</div>
      <LanguageSwitcher />  {/* Aquí */}
    </nav>
  );
}
```

### **Opción 2: En la página de Login**
```javascript
// src/pages/Login.jsx
import LanguageSwitcher from '../components/LanguageSwitcher';

function Login() {
  return (
    <div>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />  {/* Esquina superior derecha */}
      </div>
      {/* Resto del login */}
    </div>
  );
}
```

### **Opción 3: En el Footer**
```javascript
// src/components/Footer.jsx
import LanguageSwitcher from './LanguageSwitcher';

function Footer() {
  return (
    <footer>
      <LanguageSwitcher />
    </footer>
  );
}
```

---

## 🎯 Ejemplo Completo: Login Traducido

```javascript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Selector de idioma en esquina */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        {/* Título traducido */}
        <h1 className="text-3xl font-bold text-center mb-2">
          {t('login.title')}
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {t('login.subtitle')}
        </p>

        <form>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {t('common.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('common.email')}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {t('common.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('common.password')}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Botón */}
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
            {t('login.button')}
          </button>
        </form>

        {/* Links */}
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-blue-600">
            {t('common.forgotPassword')}
          </Link>
        </div>

        <div className="mt-2 text-center text-sm">
          {t('common.dontHaveAccount')}{' '}
          <Link to="/signup" className="text-blue-600 font-semibold">
            {t('common.signup')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
```

---

## 📝 Claves de Traducción Disponibles

### **Common (Comunes)**
- `common.welcome`
- `common.login`
- `common.signup`
- `common.email`
- `common.password`
- `common.save`
- `common.cancel`
- etc.

### **Landing**
- `landing.title`
- `landing.subtitle`
- `landing.description`

### **Login**
- `login.title`
- `login.subtitle`
- `login.button`
- `login.client`
- `login.business`

### **Client**
- `client.home.welcome`
- `client.home.qrTitle`
- `client.home.totalPoints`
- `client.points.title`
- `client.map.title`

### **Business**
- `business.home.welcome`
- `business.scan.title`
- `business.clients.title`
- `business.rewards.title`

---

## 🔄 Cambiar Idioma Programáticamente

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();

  // Cambiar a inglés
  const switchToEnglish = () => {
    i18n.changeLanguage('en');
  };

  // Cambiar a español
  const switchToSpanish = () => {
    i18n.changeLanguage('es');
  };

  // Obtener idioma actual
  const currentLanguage = i18n.language; // 'es' o 'en'

  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <button onClick={switchToEnglish}>English</button>
      <button onClick={switchToSpanish}>Español</button>
    </div>
  );
}
```

---

## ✅ Checklist de Implementación

- [x] Instalar dependencias
- [x] Configurar i18n.js
- [x] Crear archivos de traducción
- [x] Crear LanguageSwitcher
- [x] Inicializar en main.jsx
- [ ] Agregar LanguageSwitcher al Navbar
- [ ] Actualizar componentes con t()
- [ ] Probar cambio de idioma
- [ ] Verificar detección automática

---

## 🧪 Probar la Implementación

1. **Abrir la aplicación**
2. **Verificar idioma detectado** (debe ser el del navegador)
3. **Cambiar idioma manualmente** con el LanguageSwitcher
4. **Recargar la página** (debe mantener el idioma seleccionado)
5. **Cambiar idioma del navegador** y abrir en incógnito (debe detectar el nuevo idioma)

---

## 📚 Documentación Completa

Ver `I18N.md` para documentación detallada.

---

**¡Listo para usar!** 🚀
