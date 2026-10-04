#!/bin/bash

BASE="/Test"

echo "🔧 Corrigiendo proyecto..."

# HTML
find . -type f -name "*.html" \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i \
  -e 's|href="/"|href="/"|g' \
  -e 's|href='\''/'\''|href='\''/'\''|g' \
  -e 's|src="/assets/|src="/assets/|g' \
  -e 's|href="/assets/|href="/assets/|g' \
  {} \;

# JS
find . -type f -name "*.js" \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i \
  -e 's|href:"/"|href:"/"|g' \
  -e "s|href:'/'|href:'/'|g" \
  -e 's|href:"/assets/|href:"/assets/|g' \
  -e "s|href:'/assets/|href:'/assets/|g" \
  -e 's|src:"/assets/|src:"/assets/|g' \
  -e "s|src:'/assets/|src:'/assets/|g" \
  -e 's|../../../assets/|/assets/|g' \
  -e 's|../../assets/|/assets/|g' \
  -e 's|../assets/|/assets/|g' \
  {} \;

# CSS
find . -type f -name "*.css" \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i \
  -e 's|/assets/|/assets/|g' \
  {} \;

# Asegurar logo
if [ -f "assets/img/logo.jpg" ]; then
    echo "✅ Logo encontrado"
else
    echo "❌ ERROR: no existe assets/img/logo.jpg"
fi

# Mostrar rutas problemáticas restantes
echo ""
echo "🔎 Comprobando rutas..."

grep -RnoE 'href:"/"|href="/"|src="/assets|href="/assets|../../../assets' \
  --include="*.html" \
  --include="*.js" \
  --include="*.css" \
  . \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  | head -30

echo ""
echo "📤 Subiendo cambios..."

git add .
git commit -m "fix github pages base path"
git push

echo ""
echo "✅ TERMINADO"
echo "🌐 https://71x7.github.io/"
