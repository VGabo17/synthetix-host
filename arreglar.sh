#!/bin/bash

echo "🔧 Arreglando rutas de GitHub Pages..."

# 1. Corregir rutas de assets
find . -type f \( -name "*.html" -o -name "*.js" -o -name "*.css" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i \
  -e 's|"/assets/|"/assets/|g' \
  -e "s|'/assets/|'/assets/|g" \
  -e 's|url(/assets/|url(/assets/|g' \
  {} \;

# 2. Corregir enlaces que mandan a /
find . -type f -name "*.html" \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i \
  -e 's|href="/"|href="/"|g' \
  -e "s|href='/'|href='/'|g" \
  {} \;

# 3. Corregir los logos que están mal puestos en app.js
sed -i 's|../../../assets/|/assets/|g' assets/js/dist/app.js 2>/dev/null

# 4. Asegurar que index.html use el logo correcto
sed -i 's|src="/assets/img/logo.jpg"|src="/assets/img/logo.jpg"|g' index.html
sed -i 's|href="/assets/img/logo.jpg"|href="/assets/img/logo.jpg"|g' index.html

echo "✅ Rutas corregidas."
echo "📦 Comprobando logo..."

if [ -f "assets/img/logo.jpg" ]; then
    echo "✅ assets/img/logo.jpg EXISTE"
else
    echo "❌ NO EXISTE assets/img/logo.jpg"
fi

echo ""
echo "Ahora ejecuta:"
echo "git add ."
echo 'git commit -m "fix github pages paths"'
echo "git push"
