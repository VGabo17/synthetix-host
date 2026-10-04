#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "======================================"
echo "   FIX GITHUB PAGES - 71x7/Test"
echo "======================================"

cd "$(dirname "$0")"

python3 <<'PY'
from pathlib import Path
import re

ROOT = Path(".").resolve()

# Archivos donde pueden aparecer rutas absolutas
extensions = {
    ".html", ".htm", ".css", ".js", ".mjs",
    ".json", ".jsx", ".tsx", ".ts"
}

# No tocar .git ni node_modules
ignored = {".git", "node_modules"}

changed = 0

for path in ROOT.rglob("*"):
    if not path.is_file():
        continue

    if any(part in ignored for part in path.parts):
        continue

    if path.suffix.lower() not in extensions:
        continue

    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, PermissionError):
        continue

    # Ruta desde el directorio del archivo hasta la raíz del proyecto
    rel_dir = path.parent.relative_to(ROOT)

    if str(rel_dir) == ".":
        prefix = ""
    else:
        prefix = "../" * len(rel_dir.parts)

    asset_path = prefix + "assets/"

    original = text

    # /assets/... -> ruta relativa correcta
    text = re.sub(
        r'(?<![\w.-])/assets/',
        asset_path,
        text
    )

    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"[FIX] {path}")
        changed += 1

print()
print(f"Archivos corregidos: {changed}")
PY

echo
echo "======================================"
echo " Verificando rutas restantes..."
echo "======================================"

if grep -R "/assets/" \
    --include="*.html" \
    --include="*.htm" \
    --include="*.css" \
    --include="*.js" \
    --include="*.mjs" \
    --exclude-dir=.git \
    --exclude-dir=node_modules \
    . 2>/dev/null; then

    echo
    echo "⚠️ Todavía existen rutas /assets/."
    echo "Revisa los resultados anteriores."
else
    echo "✅ No quedan rutas /assets/ absolutas."
fi

echo
echo "======================================"
echo " Git status"
echo "======================================"

git status --short

echo
echo "======================================"
echo " Guardando cambios..."
echo "======================================"

git add .

if git diff --cached --quiet; then
    echo "ℹ️ No hay cambios nuevos para guardar."
else
    git commit -m "Fix GitHub Pages asset paths"
    git push
fi

echo
echo "======================================"
echo " ✅ TERMINADO"
echo "======================================"
echo
echo "Página:"
echo "https://71x7.github.io/"
