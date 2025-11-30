#!/usr/bin/env node

/**
 * Script de verificación pre-despliegue
 * Verifica que la configuración esté correcta antes de desplegar a Vercel
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const errors = [];
const warnings = [];
const success = [];

console.log('🔍 Verificando configuración de despliegue...\n');

// 1. Verificar que existe .env.production
if (existsSync(join(__dirname, '.env.production'))) {
  success.push('✅ Archivo .env.production existe');
  
  const envProd = readFileSync(join(__dirname, '.env.production'), 'utf-8');
  if (envProd.includes('https://rewardshub-vvaj.onrender.com')) {
    success.push('✅ URL del backend configurada correctamente en .env.production');
  } else {
    errors.push('❌ URL del backend no encontrada en .env.production');
  }
} else {
  errors.push('❌ Archivo .env.production no existe');
}

// 2. Verificar que existe vercel.json
if (existsSync(join(__dirname, 'vercel.json'))) {
  success.push('✅ Archivo vercel.json existe');
  
  const vercelConfig = JSON.parse(readFileSync(join(__dirname, 'vercel.json'), 'utf-8'));
  
  if (vercelConfig.rewrites) {
    success.push('✅ Rewrites configurados para React Router');
  } else {
    warnings.push('⚠️  No se encontraron rewrites en vercel.json');
  }
  
  if (vercelConfig.env && vercelConfig.env.VITE_API_URL) {
    success.push('✅ Variable VITE_API_URL configurada en vercel.json');
  } else {
    warnings.push('⚠️  Variable VITE_API_URL no encontrada en vercel.json');
  }
} else {
  errors.push('❌ Archivo vercel.json no existe');
}

// 3. Verificar .gitignore
if (existsSync(join(__dirname, '.gitignore'))) {
  const gitignore = readFileSync(join(__dirname, '.gitignore'), 'utf-8');
  
  if (gitignore.includes('.env') && !gitignore.includes('!.env.production')) {
    warnings.push('⚠️  .env está en .gitignore pero .env.production podría no incluirse');
  } else if (gitignore.includes('!.env.production')) {
    success.push('✅ .gitignore configurado correctamente para .env.production');
  }
} else {
  warnings.push('⚠️  Archivo .gitignore no existe');
}

// 4. Verificar package.json
if (existsSync(join(__dirname, 'package.json'))) {
  const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
  
  if (pkg.scripts && pkg.scripts.build) {
    success.push('✅ Script de build configurado');
  } else {
    errors.push('❌ Script de build no encontrado en package.json');
  }
  
  if (pkg.dependencies && pkg.dependencies.axios) {
    success.push('✅ Axios instalado para peticiones HTTP');
  }
} else {
  errors.push('❌ Archivo package.json no existe');
}

// 5. Verificar src/services/api.js
if (existsSync(join(__dirname, 'src', 'services', 'api.js'))) {
  const apiFile = readFileSync(join(__dirname, 'src', 'services', 'api.js'), 'utf-8');
  
  if (apiFile.includes('import.meta.env.VITE_API_URL')) {
    success.push('✅ api.js usa correctamente import.meta.env.VITE_API_URL');
  } else {
    errors.push('❌ api.js no usa import.meta.env.VITE_API_URL');
  }
  
  if (apiFile.includes('withCredentials: true')) {
    success.push('✅ withCredentials configurado para CORS');
  } else {
    warnings.push('⚠️  withCredentials no configurado (puede causar problemas de CORS)');
  }
} else {
  errors.push('❌ Archivo src/services/api.js no existe');
}

// Mostrar resultados
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (success.length > 0) {
  console.log('✨ Verificaciones exitosas:\n');
  success.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  Advertencias:\n');
  warnings.forEach(msg => console.log(`  ${msg}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errores encontrados:\n');
  errors.forEach(msg => console.log(`  ${msg}`));
  console.log('');
  console.log('Por favor, corrige los errores antes de desplegar.\n');
  process.exit(1);
} else {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉 ¡Todo listo para desplegar a Vercel!\n');
  console.log('Ejecuta: vercel --prod\n');
  process.exit(0);
}
