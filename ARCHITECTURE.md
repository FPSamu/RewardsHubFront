# 🏗️ Arquitectura de RewardsHub

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                │
│                                                                 │
│  👤 Clientes                          🏢 Negocios               │
│  - Ver QR personal                    - Escanear QR clientes    │
│  - Ver recompensas                    - Configurar recompensas  │
│  - Ver mapa de negocios               - Ver clientes            │
│  - Acumular puntos                    - Dashboard analytics     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                            │
│                                                                 │
│  📱 React + Vite + Tailwind CSS                                 │
│  🌐 https://rewards-hub-opal.vercel.app/                        │
│                                                                 │
│  Componentes Principales:                                       │
│  ├── 🔐 Autenticación (Login/Registro)                          │
│  ├── 📊 Dashboards (Cliente/Negocio)                            │
│  ├── 📷 QR Scanner & Generator                                  │
│  ├── 🗺️ Mapa Interactivo (Leaflet)                             │
│  └── 🎁 Sistema de Recompensas                                  │
│                                                                 │
│  Variables de Entorno:                                          │
│  └── VITE_API_URL=https://rewardshub-vvaj.onrender.com         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                         HTTPS/REST API
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Render)                             │
│                                                                 │
│  ⚙️ Node.js + Express + TypeScript                              │
│  🌐 https://rewardshub-vvaj.onrender.com/                       │
│                                                                 │
│  Endpoints Principales:                                         │
│  ├── /auth/*          - Autenticación de clientes               │
│  ├── /business/*      - Autenticación de negocios               │
│  ├── /rewards/*       - Gestión de recompensas                  │
│  ├── /transactions/*  - Transacciones de puntos                 │
│  └── /system/*        - Configuración del sistema               │
│                                                                 │
│  Seguridad:                                                     │
│  ├── 🔒 JWT Authentication                                      │
│  ├── 🛡️ CORS configurado                                       │
│  └── 🔐 bcrypt para passwords                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                                │
│                                                                 │
│  🗄️ PostgreSQL / MongoDB (según configuración)                 │
│                                                                 │
│  Colecciones/Tablas:                                            │
│  ├── users          - Usuarios (clientes)                       │
│  ├── businesses     - Negocios registrados                      │
│  ├── rewards        - Recompensas configuradas                  │
│  ├── transactions   - Historial de puntos                       │
│  └── user_points    - Puntos por usuario/negocio                │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### Flujo de Autenticación

```
Cliente/Negocio
    ↓
[Login Form] → POST /auth/login o /business/login
    ↓
Backend valida credenciales
    ↓
Retorna JWT Token + User Data
    ↓
Frontend guarda en localStorage
    ↓
Token se incluye en todas las peticiones (Authorization: Bearer)
```

### Flujo de Acumulación de Puntos

```
Cliente muestra QR
    ↓
Negocio escanea QR → [BusinessScan.jsx]
    ↓
Negocio ingresa monto de compra
    ↓
POST /transactions/add-points
    ↓
Backend calcula puntos según configuración del negocio
    ↓
Actualiza puntos del cliente
    ↓
Retorna confirmación
    ↓
Cliente ve puntos actualizados en dashboard
```

### Flujo de Canje de Recompensas

```
Cliente ve recompensas disponibles → [ClientPoints.jsx]
    ↓
Cliente selecciona recompensa
    ↓
POST /rewards/redeem
    ↓
Backend verifica puntos suficientes
    ↓
Deduce puntos del cliente
    ↓
Marca recompensa como canjeada
    ↓
Cliente recibe confirmación
```

## 🌐 Configuración de Red

### Desarrollo Local

```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

### Producción

```
Frontend: https://rewards-hub-opal.vercel.app/
Backend:  https://rewardshub-vvaj.onrender.com/
```

### Red Local (Desarrollo móvil)

```
Frontend: http://[TU_IP]:5173
Backend:  http://[TU_IP]:3000

Ejemplo:
Frontend: http://192.168.1.67:5173
Backend:  http://192.168.1.67:3000
```

## 🔐 Seguridad

### Frontend
- ✅ Tokens JWT almacenados en localStorage
- ✅ Rutas protegidas con ProtectedRoute
- ✅ Validación de tipo de usuario (client/business)
- ✅ Auto-logout en error 401

### Backend
- ✅ JWT con expiración
- ✅ Refresh tokens
- ✅ Passwords hasheados con bcrypt
- ✅ CORS configurado
- ✅ Validación de datos en endpoints

## 📦 Tecnologías

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.2.0 | Framework UI |
| Vite | 5.0.8 | Build tool |
| React Router | 6.20.0 | Routing |
| Tailwind CSS | 3.3.6 | Estilos |
| Axios | 1.6.2 | HTTP client |
| qrcode.react | 4.2.0 | Generación QR |
| html5-qrcode | 2.3.8 | Escaneo QR |
| react-leaflet | 4.2.1 | Mapas |

### Backend
| Tecnología | Propósito |
|------------|-----------|
| Node.js | Runtime |
| Express | Framework web |
| TypeScript | Tipado estático |
| JWT | Autenticación |
| bcrypt | Hashing passwords |

## 🚀 Despliegue

### Vercel (Frontend)
- ✅ Despliegue automático desde Git
- ✅ Variables de entorno configuradas
- ✅ SPA routing configurado
- ✅ CDN global

### Render (Backend)
- ✅ Despliegue desde repositorio
- ✅ Variables de entorno configuradas
- ✅ Auto-deploy en push
- ✅ SSL/HTTPS automático

## 📊 Estado del Proyecto

| Componente | Estado | Notas |
|------------|--------|-------|
| Frontend Development | ✅ Completo | Todas las páginas implementadas |
| Backend API | ✅ Completo | Todos los endpoints funcionando |
| Autenticación | ✅ Completo | JWT + Refresh tokens |
| QR System | ✅ Completo | Generación y escaneo |
| Mapas | ✅ Completo | Leaflet integrado |
| Despliegue Frontend | ✅ Configurado | Listo para Vercel |
| Despliegue Backend | ✅ Activo | Render funcionando |
| CORS | ⚠️ Verificar | Configurar en backend |
| Testing | 🔄 Pendiente | Agregar tests |
| Documentación | ✅ Completo | README + DEPLOYMENT |
