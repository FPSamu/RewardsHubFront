# 🚀 Guía de Despliegue - RewardsHub Frontend

## 📋 Resumen

- **Frontend**: Vercel - https://rewards-hub-opal.vercel.app/
- **Backend**: Render - https://rewardshub-vvaj.onrender.com/

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno

El proyecto usa diferentes archivos `.env` según el entorno:

- **`.env.production`** - Usado automáticamente por Vercel en producción
- **`.env`** - Para desarrollo local (no se sube a git)
- **`.env.local`** - Alternativa para desarrollo local (no se sube a git)
- **`.env.example`** - Plantilla con ejemplos

### 2. Configuración Actual

✅ **Producción (Vercel)**
```
VITE_API_URL=https://rewardshub-vvaj.onrender.com
```

✅ **Desarrollo Local**
```
VITE_API_URL=http://localhost:3000
```

---

## 🌐 Desplegar en Vercel

### Opción 1: Desde la Interfaz Web de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno:
   - Ve a: **Settings** → **Environment Variables**
   - Agrega: `VITE_API_URL` = `https://rewardshub-vvaj.onrender.com`
4. Haz clic en **Deploy**

### Opción 2: Desde la Terminal (Vercel CLI)

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Login a Vercel
vercel login

# Desplegar
vercel

# O desplegar a producción directamente
vercel --prod
```

### Opción 3: Despliegue Automático con Git

1. Conecta tu repositorio a Vercel
2. Cada push a `main` desplegará automáticamente
3. Las variables de entorno se toman de `.env.production` o del dashboard de Vercel

---

## 📦 Build Local

Para probar el build de producción localmente:

```bash
# Instalar dependencias
npm install

# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## 🔍 Verificación del Despliegue

### 1. Verificar que el Frontend se Conecta al Backend

Abre la consola del navegador en tu sitio de Vercel y verifica:

```javascript
// En la consola del navegador
console.log(import.meta.env.VITE_API_URL)
// Debería mostrar: https://rewardshub-vvaj.onrender.com
```

### 2. Probar Endpoints

Prueba hacer login o registro y verifica en la pestaña **Network** que las peticiones van a:
```
https://rewardshub-vvaj.onrender.com/auth/login
https://rewardshub-vvaj.onrender.com/business/login
```

### 3. Verificar CORS en el Backend

Asegúrate de que el backend en Render tenga configurado CORS para permitir:
```
https://rewards-hub-opal.vercel.app
```

---

## 🐛 Solución de Problemas

### Error: "Network Error" o "CORS Error"

**Problema**: El backend no permite peticiones desde Vercel

**Solución**: En el backend (Render), configura CORS:
```javascript
// En tu backend
app.use(cors({
  origin: [
    'https://rewards-hub-opal.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

### Error: "Cannot GET /client/dashboard"

**Problema**: Vercel no está redirigiendo correctamente las rutas de React

**Solución**: Ya está resuelto con `vercel.json`. Si persiste, verifica que el archivo existe.

### Error: Variables de entorno no se cargan

**Problema**: Las variables `VITE_*` no están disponibles

**Solución**: 
1. Asegúrate de que las variables empiecen con `VITE_`
2. Reconstruye el proyecto en Vercel
3. Verifica en Settings → Environment Variables

---

## 📝 Checklist de Despliegue

- [x] `.env.production` creado con URL de Render
- [x] `vercel.json` configurado para routing de React
- [x] `.gitignore` actualizado para no subir `.env`
- [x] Variables de entorno configuradas en Vercel
- [ ] Backend en Render tiene CORS configurado para Vercel
- [ ] Probar login desde Vercel
- [ ] Probar registro desde Vercel
- [ ] Probar funcionalidades principales

---

## 🔄 Actualizar el Despliegue

### Método 1: Git Push (Recomendado)

```bash
git add .
git commit -m "Update: descripción de cambios"
git push origin main
```

Vercel detectará el push y desplegará automáticamente.

### Método 2: Vercel CLI

```bash
vercel --prod
```

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Variables de Entorno en Vite](https://vitejs.dev/guide/env-and-mode.html)
- [React Router en Vercel](https://vercel.com/guides/deploying-react-with-vercel)

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica la consola del navegador
3. Comprueba que el backend esté activo en Render
