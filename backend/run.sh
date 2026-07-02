#!/usr/bin/env bash
set -e

# Ir a la carpeta del backend (donde esta este script)
cd "$(dirname "$0")"

echo "============================================================"
echo " HowMany? - Backend Setup y Arranque"
echo "============================================================"

VENV_DIR="../.venv"

# Crear entorno virtual si no existe
if [ ! -f "$VENV_DIR/bin/activate" ]; then
    echo "[1/3] Creando entorno virtual..."
    python3 -m venv "$VENV_DIR"
    echo "      Entorno virtual creado en .venv/"
else
    echo "[1/3] Entorno virtual ya existe, reutilizando..."
fi

# Activar entorno virtual
echo "[2/3] Activando entorno virtual..."
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

# Instalar dependencias
echo "[3/3] Instalando/verificando dependencias..."
pip install -r requirements.txt --quiet

echo ""
echo "============================================================"
echo " Backend listo. Iniciando servidor en http://localhost:8000"
echo " Presiona Ctrl+C para detener."
echo "============================================================"
echo ""

python src/main.py
