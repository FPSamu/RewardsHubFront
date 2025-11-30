# 🚀 Comandos para Desplegar a Vercel

# ============================================
# OPCIÓN 1: Despliegue Automático con Git
# ============================================

# 1. Verificar el estado de Git
git status

# 2. Agregar todos los archivos modificados
git add .

# 3. Hacer commit con mensaje descriptivo
git commit -m "feat: Configure for Vercel deployment with Render backend

- Update .env with production API URL
- Add .env.production for Vercel
- Create vercel.json for SPA routing
- Update .gitignore for environment files
- Add deployment verification script
- Add documentation (DEPLOYMENT.md, CHANGES.md)
- Update package.json with new scripts"

# 4. Push a la rama principal
git push origin main

# Vercel detectará el push y desplegará automáticamente
# Monitorea el progreso en: https://vercel.com/dashboard


# ============================================
# OPCIÓN 2: Despliegue Manual con Vercel CLI
# ============================================

# 1. Instalar Vercel CLI globalmente (solo la primera vez)
npm install -g vercel

# 2. Login a Vercel
vercel login

# 3. Desplegar a producción
vercel --prod

# Sigue las instrucciones en pantalla


# ============================================
# VERIFICACIÓN POST-DESPLIEGUE
# ============================================

# Abrir el sitio en el navegador
start https://rewards-hub-opal.vercel.app/

# O en macOS/Linux:
# open https://rewards-hub-opal.vercel.app/


# ============================================
# COMANDOS ÚTILES
# ============================================

# Ver logs de Vercel
vercel logs

# Ver información del proyecto
vercel inspect

# Listar todos los despliegues
vercel ls

# Rollback a un despliegue anterior
vercel rollback [deployment-url]

# Remover un despliegue
vercel rm [deployment-url]


# ============================================
# DESARROLLO LOCAL
# ============================================

# Desarrollo normal
npm run dev

# Desarrollo con acceso desde red local (para celular)
npm run dev:host

# Build de producción local
npm run build

# Preview del build
npm run preview

# Verificar configuración antes de desplegar
npm run verify


# ============================================
# TROUBLESHOOTING
# ============================================

# Si hay problemas con el despliegue:

# 1. Verificar que las variables de entorno estén configuradas
vercel env ls

# 2. Agregar variable de entorno manualmente
vercel env add VITE_API_URL production

# 3. Forzar un nuevo despliegue
vercel --prod --force

# 4. Ver logs en tiempo real
vercel logs --follow
