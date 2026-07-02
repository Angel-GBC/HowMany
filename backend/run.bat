@echo off
setlocal

echo ============================================================
echo  HowMany? - Backend Setup y Arranque
echo ============================================================

REM Ir a la carpeta del backend (donde esta este .bat)
cd /d "%~dp0"

REM Crear entorno virtual si no existe
if not exist "..\\.venv\\Scripts\\activate.bat" (
    echo [1/3] Creando entorno virtual...
    python -m venv ..\\.venv
    if errorlevel 1 (
        echo ERROR: No se pudo crear el entorno virtual. Verifica que Python 3.11+ este instalado.
        pause
        exit /b 1
    )
    echo       Entorno virtual creado en .venv\
) else (
    echo [1/3] Entorno virtual ya existe, reutilizando...
)

REM Activar entorno virtual
echo [2/3] Activando entorno virtual...
call ..\\.venv\\Scripts\\activate.bat

REM Instalar dependencias
echo [3/3] Instalando/verificando dependencias...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias.
    pause
    exit /b 1
)

REM Liberar el puerto 8000 si esta ocupado
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Liberando puerto 8000 ^(PID %%p^)...
    taskkill /PID %%p /F >nul 2>&1
)

echo.
echo ============================================================
echo  Backend listo. Iniciando servidor en http://localhost:8000
echo  Presiona Ctrl+C para detener.
echo ============================================================
echo.

python src\main.py

pause
