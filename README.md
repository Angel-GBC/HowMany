# HowMany?

Aplicación web para contar personas en tiempo real usando visión por computadora.

**Demo en vivo → [howmany-frontend.vercel.app](https://howmany-frontend.vercel.app/)**

---

## ¿Cómo funciona?

El navegador accede a tu cámara directamente (sin instalar nada), envía los frames a un backend con YOLOv8 desplegado en la nube, y dibuja los recuadros de detección sobre el video en tiempo real.

```
Cámara → Navegador → WebSocket → YOLOv8 (nube) → Recuadros en pantalla
```

## Funcionalidades

- Detección de personas en tiempo real con bounding boxes
- Contador de personas presentes en el frame actual
- Contador del máximo simultáneo alcanzado en la sesión
- Selector de cámara (usa los dispositivos detectados por el navegador)
- Historial de sesiones (guardado en memoria mientras la pestaña está abierta)

## Stack

| Parte | Tecnología |
|---|---|
| Detección | YOLOv8n (ultralytics) |
| Backend | FastAPI + WebSockets (Python) |
| Frontend | React + TypeScript + Vite + TailwindCSS |
| Hosting backend | Hugging Face Spaces (gratis) |
| Hosting frontend | Vercel (gratis) |

---

## Correr localmente

### Requisitos
- Python 3.11+
- Node.js 18+
- Una cámara conectada

### Backend

**Windows:**
```powershell
cd backend
.\run.bat
```

**Linux / macOS:**
```bash
cd backend
chmod +x run.sh
./run.sh
```

El script crea el entorno virtual, instala las dependencias y arranca el servidor en `http://localhost:7860`. La primera vez descarga el modelo `yolov8n.pt` (~6 MB) automáticamente.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173` en el navegador.

> El `.env` debe tener `VITE_BACKEND_URL=http://localhost:7860` para apuntar al backend local.
