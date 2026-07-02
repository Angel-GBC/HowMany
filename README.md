# HowMany?

Conteo de personas en tiempo real — **100% gratuito**, sin nada local.

| Componente | Plataforma | Costo |
|---|---|---|
| Backend (YOLO + FastAPI) | Hugging Face Spaces | Gratis |
| Frontend (React) | Vercel | Gratis |

**Cómo funciona:**
El navegador captura la cámara con `getUserMedia`, envía los frames por WebSocket al backend en HF Spaces, que corre YOLO y devuelve las detecciones. El navegador dibuja los recuadros sobre el video local.

---

## Despliegue paso a paso

### 1. Backend → Hugging Face Spaces

#### 1.1 Crear cuenta y Space

1. Ve a [huggingface.co](https://huggingface.co) → **Sign Up** (gratis, no pide tarjeta)
2. Una vez dentro, haz clic en tu avatar (arriba a la derecha) → **New Space**
3. Rellena el formulario:
   - **Space name:** `howmany-backend`
   - **License:** MIT (o cualquiera)
   - **SDK:** selecciona **Docker** (importante, no Gradio ni Streamlit)
   - **Visibility:** Public
4. Haz clic en **Create Space** — HF crea un repositorio Git vacío

#### 1.2 Crear un token de acceso en HuggingFace

HF ya no acepta contraseña por Git. Necesitas un token:

1. Ve a [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Haz clic en **New token**
3. Ponle cualquier nombre (ej. `howmany-deploy`)
4. Tipo: **Write**
5. Haz clic en **Generate token** y **copia el token** (empieza con `hf_...`)

#### 1.3 Clonar el Space y subir el backend

Abre una terminal en la carpeta `HowMany` y ejecuta:

```powershell
# 1. Clona el Space incluyendo el token en la URL
#    Reemplaza TU_USUARIO y pega tu token donde dice TU_TOKEN
git clone https://TU_USUARIO:TU_TOKEN@huggingface.co/spaces/TU_USUARIO/howmany-backend

# Ejemplo real:
# git clone https://AGBC:hf_aBcDeFgH...@huggingface.co/spaces/AGBC/howmany-backend

# 2. Entra a la carpeta clonada
cd howmany-backend

# 3. Copia todos los archivos del backend
xcopy /E /I /Y "..\backend\src" "src\"
copy "..\backend\Dockerfile" "Dockerfile"
copy "..\backend\requirements.txt" "requirements.txt"

# 4. Copia el README especial de HF (tiene el YAML que activa Docker)
copy "..\backend\HF_SPACE_README.md" "README.md"

# 5. Sube todo
git add .
git commit -m "deploy howmany backend"
git push
```

#### 1.4 Esperar el build

- Ve a tu Space en `https://huggingface.co/spaces/TU_USUARIO/howmany-backend`
- Verás un indicador **Building** (tarda ~5 minutos la primera vez)
- Cuando diga **Running**, el backend está listo
- La URL pública del backend es: `https://TU_USUARIO-howmany-backend.hf.space`

> Puedes verificar que funciona abriendo `https://TU_USUARIO-howmany-backend.hf.space/health` en el navegador — debe responder `{"status":"ok"}`

#### 1.5 Configurar CORS (para permitir tu frontend de Vercel)

1. En tu Space → pestaña **Settings** → sección **Variables and secrets**
2. Haz clic en **New variable**:
   - Name: `ALLOWED_ORIGINS`
   - Value: `https://howmany.vercel.app` ← pon aquí la URL exacta de Vercel (la obtienes en el paso 2)
3. El Space se reinicia solo con la nueva variable

### 2. Frontend → Vercel

1. Crea cuenta en [vercel.com](https://vercel.com) (gratis)
2. **New Project → Import Git Repository** → selecciona este repo
3. En **Root Directory** escribe `frontend`
4. En **Environment Variables** agrega:
   ```
   VITE_BACKEND_URL=https://TU_USUARIO-howmany-backend.hf.space
   ```
5. Click **Deploy** → tu frontend queda en `https://howmany.vercel.app`

### 3. Configura CORS en el Space

En HF Spaces → Settings → Variables → agrega:
```
ALLOWED_ORIGINS=https://howmany.vercel.app
```
El Space se reinicia automáticamente.

---

## Uso

1. Abre la URL de Vercel en el navegador
2. Acepta el permiso de cámara cuando el navegador lo pida
3. Selecciona la cámara en el dropdown
4. Presiona **Iniciar grabación**
5. Ves el video con recuadros verdes sobre cada persona detectada
6. Los contadores se actualizan en tiempo real
7. Al detener, el máximo de la sesión se guarda en el historial

---

## Desarrollo local

```powershell
# Backend
cd backend
.\run.bat          # crea .venv, instala deps, arranca en :7860

# Frontend (otra terminal)
cd frontend
npm install
cp .env.example .env    # edita VITE_BACKEND_URL=http://localhost:7860
npm run dev             # abre http://localhost:5173
```

---

## Variables de entorno

| Variable | Dónde se pone | Valor |
|---|---|---|
| `ALLOWED_ORIGINS` | HF Spaces → Settings | URL de Vercel |
| `VITE_BACKEND_URL` | Vercel → Settings | URL de HF Space |
| `PORT` | Automático en HF (7860) | No tocar |
