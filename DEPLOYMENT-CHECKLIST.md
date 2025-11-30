# ✅ Checklist de Despliegue - RewardsHub Frontend

## 📋 Pre-Despliegue

### Configuración de Archivos
- [x] `.env` actualizado con URL de producción
- [x] `.env.production` creado
- [x] `vercel.json` configurado
- [x] `.gitignore` actualizado
- [x] `package.json` con scripts de despliegue

### Verificación de Código
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run build` completa exitosamente
- [ ] `npm run verify` pasa todas las verificaciones
- [ ] No hay console.logs innecesarios en producción

### Documentación
- [x] README.md actualizado
- [x] DEPLOYMENT.md creado
- [x] ARCHITECTURE.md creado
- [x] CHANGES.md creado
- [x] .env.example actualizado

---

## 🚀 Despliegue

### Git & GitHub
- [ ] Todos los cambios están en staging (`git add .`)
- [ ] Commit creado con mensaje descriptivo
- [ ] Push a rama principal (`git push origin main`)
- [ ] GitHub Actions (si aplica) pasan exitosamente

### Vercel
- [ ] Proyecto conectado a GitHub en Vercel
- [ ] Variables de entorno configuradas en Vercel Dashboard
  - [ ] `VITE_API_URL` = `https://rewardshub-vvaj.onrender.com`
- [ ] Build settings correctos:
  - [ ] Framework Preset: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Despliegue completado sin errores
- [ ] URL de producción accesible

---

## 🔍 Post-Despliegue

### Verificación Básica
- [ ] Sitio carga correctamente en https://rewards-hub-opal.vercel.app/
- [ ] No hay errores en la consola del navegador
- [ ] Variables de entorno se cargan correctamente
  ```javascript
  // En consola del navegador:
  console.log(import.meta.env.VITE_API_URL)
  // Debe mostrar: https://rewardshub-vvaj.onrender.com
  ```

### Verificación de Rutas
- [ ] Landing page (`/`) funciona
- [ ] Login page (`/login`) funciona
- [ ] Signup pages (`/signup/*`) funcionan
- [ ] Client dashboard accesible después de login
- [ ] Business dashboard accesible después de login
- [ ] Refresh en rutas internas no da 404

### Verificación de API
- [ ] Login de cliente funciona
- [ ] Login de negocio funciona
- [ ] Registro de cliente funciona
- [ ] Registro de negocio funciona
- [ ] Peticiones van a la URL correcta de Render
- [ ] Tokens JWT se guardan correctamente
- [ ] Auto-logout funciona en error 401

### Verificación de CORS
- [ ] No hay errores de CORS en la consola
- [ ] Backend acepta peticiones desde Vercel
- [ ] Cookies/credentials funcionan correctamente

### Funcionalidades Principales

#### Cliente
- [ ] QR code se genera correctamente
- [ ] Mapa de negocios carga
- [ ] Lista de recompensas se muestra
- [ ] Puntos se muestran correctamente
- [ ] Navegación entre páginas funciona

#### Negocio
- [ ] Dashboard carga correctamente
- [ ] Lista de clientes se muestra
- [ ] Configuración de recompensas funciona
- [ ] Scanner de QR funciona
- [ ] Transacciones se registran

### Performance
- [ ] Tiempo de carga inicial < 3 segundos
- [ ] Imágenes optimizadas
- [ ] No hay memory leaks evidentes
- [ ] Navegación es fluida

### Responsive Design
- [ ] Funciona en desktop (1920x1080)
- [ ] Funciona en tablet (768x1024)
- [ ] Funciona en móvil (375x667)
- [ ] Funciona en móvil (414x896)

### SEO & Metadata
- [ ] Title tag correcto en todas las páginas
- [ ] Meta descriptions presentes
- [ ] Favicon carga correctamente
- [ ] Open Graph tags (si aplica)

---

## 🔧 Configuración del Backend

### CORS en Render
- [ ] Backend acepta origen de Vercel
  ```javascript
  const allowedOrigins = [
    'https://rewards-hub-opal.vercel.app',
    'http://localhost:5173'
  ];
  ```
- [ ] `credentials: true` configurado
- [ ] Headers CORS correctos

### Variables de Entorno en Render
- [ ] `JWT_SECRET` configurado
- [ ] `DATABASE_URL` configurado
- [ ] `NODE_ENV=production`
- [ ] Otras variables necesarias

---

## 📊 Monitoreo

### Vercel Analytics
- [ ] Analytics habilitado en Vercel
- [ ] Revisar métricas de performance
- [ ] Revisar logs de errores

### Error Tracking
- [ ] Configurar Sentry (opcional)
- [ ] Revisar logs en Vercel Dashboard
- [ ] Configurar alertas de errores

---

## 🐛 Troubleshooting

### Si algo falla:

#### Error: "Network Error"
- [ ] Verificar que backend esté activo en Render
- [ ] Verificar CORS en backend
- [ ] Verificar URL en variables de entorno

#### Error: "Cannot GET /route"
- [ ] Verificar que `vercel.json` existe
- [ ] Verificar rewrites en `vercel.json`
- [ ] Forzar nuevo despliegue

#### Error: Variables de entorno no cargan
- [ ] Verificar que empiecen con `VITE_`
- [ ] Verificar en Vercel Dashboard → Settings → Environment Variables
- [ ] Forzar rebuild

#### Error: CORS
- [ ] Verificar `allowedOrigins` en backend
- [ ] Verificar `withCredentials` en frontend
- [ ] Verificar headers CORS en backend

---

## 📝 Notas Finales

### Después del Primer Despliegue
- [ ] Probar todas las funcionalidades principales
- [ ] Pedir a alguien más que pruebe el sitio
- [ ] Documentar cualquier issue encontrado
- [ ] Crear issues en GitHub para mejoras futuras

### Mantenimiento
- [ ] Configurar despliegues automáticos
- [ ] Establecer proceso de review de PRs
- [ ] Configurar staging environment (opcional)
- [ ] Documentar proceso de rollback

---

## 🎉 ¡Listo!

Si todos los checkboxes están marcados, ¡tu aplicación está lista para producción!

**URL de Producción**: https://rewards-hub-opal.vercel.app/

---

## 📞 Contacto de Emergencia

Si encuentras problemas críticos:

1. **Rollback inmediato**:
   ```bash
   vercel rollback [deployment-url]
   ```

2. **Ver logs**:
   ```bash
   vercel logs --follow
   ```

3. **Contactar al equipo**:
   - Crear issue en GitHub
   - Notificar en Slack/Discord
   - Documentar el problema

---

**Última actualización**: 2025-11-29
**Versión**: 1.0.0
**Estado**: ✅ Listo para producción
