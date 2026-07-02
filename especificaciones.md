# Especificaciones del Proyecto: HowMany?

> **Supuesto de diseño explícito (confirmado):** El "conteo de personas" se refiere al número de personas **presentes** en el frame actual de video en cada instante, NO a un conteo acumulado de individuos únicos (no hay tracking ni re-identificación; cada detección es independiente entre frames, sin ningún identificador persistente de persona). El sistema maneja dos valores distintos durante una sesión:
> - **Conteo actual:** personas presentes en el frame más reciente (se actualiza en tiempo real).
> - **Conteo máximo simultáneo:** el valor más alto que alcanzó el conteo actual durante toda la sesión. Este es el valor que se guarda en el historial al finalizar, y **el frontend debe etiquetarlo de forma explícita** (ej. "Máximo simultáneo en esta sesión") para que el usuario no lo confunda con un conteo acumulado de personas únicas.

---

## 1. ¿Cómo se llama mi proyecto?

**HowMany?**

---

## 2. ¿Qué problema resuelve?

Permite analizar, en tiempo real, el video proveniente de una cámara o dispositivo de grabación conectado a una computadora, para detectar y contar cuántas personas aparecen en el cuadro de video en cada momento.

---

## 3. ¿Qué funcionalidades tendrá?

- Detección de personas en tiempo real sobre el flujo de video de una cámara local.
- Dibujo de un recuadro (bounding box) alrededor de cada persona detectada.
- Conteo en tiempo real de personas presentes en el frame actual.
- Acceso a la funcionalidad mediante un frontend desplegado en la nube, que se conecta a un backend que corre localmente en la PC del usuario.
- Selección de la cámara a utilizar entre los dispositivos detectados por la PC.
- Control de inicio/detención manual de una sesión de grabación.
- Historial temporal (en memoria del navegador) con el conteo máximo de personas alcanzado en cada sesión finalizada.

---

## 4. ¿Qué tecnologías voy a usar?

### Arquitectura general: Híbrida (backend local + frontend en la nube)

El **frontend** se despliega en la nube (acceso público vía URL), pero se conecta directamente al **backend que corre en la PC del usuario** (típicamente en `http://localhost:8000` o `ws://localhost:8000`), ya que es ese backend el que tiene acceso físico a la cámara conectada a la computadora.

> Para que sea simple para el usuario final, el backend debe poder iniciarse con un solo comando o script (ver sección de "Distribución" más abajo), sin necesidad de configuración manual.

### Backend (corre localmente en la PC del usuario)

| Componente | Tecnología | Uso |
|---|---|---|
| Lenguaje | Python 3.11+ | Lenguaje principal del backend |
| Framework API/WebSocket | FastAPI + Uvicorn | Exponer endpoints REST (listar cámaras, iniciar/detener sesión) y un canal WebSocket para enviar frames procesados y conteos en tiempo real al frontend |
| Captura de video | OpenCV (`opencv-python`) | Captura de frames desde la cámara seleccionada |
| Detección de personas | YOLO vía `ultralytics` (modelo recomendado: `yolov8n.pt` o `yolov11n.pt` por velocidad en tiempo real; usar `class_id == 0` que corresponde a "person" en el dataset COCO) | Detectar únicamente personas, descartando cualquier otra clase detectada por el modelo |
| Motor de inferencia | PyTorch (dependencia de ultralytics) | Ejecución del modelo YOLO (usar GPU si está disponible vía CUDA, fallback a CPU) |
| Serialización de datos | Pydantic (incluido en FastAPI) | Definir y validar los DTOs que se envían al frontend (conteo, bounding boxes, estado de sesión) |
| Empaquetado/distribución | `requirements.txt` + script de arranque (`run.bat` para Windows / `run.sh` para Linux/Mac) | Permitir que el usuario final inicie el backend con un doble clic o un solo comando |

### Frontend (desplegado en la nube)

| Componente | Tecnología | Uso |
|---|---|---|
| Framework | React + TypeScript (Vite) | SPA que consume el backend local |
| Comunicación en tiempo real | WebSocket nativo (o `socket.io-client` si se usa Socket.IO en el backend) | Recibir conteo y bounding boxes en tiempo real para dibujarlos sobre el video |
| Renderizado de video | `<canvas>` HTML para dibujar el frame recibido + los recuadros, o `<img>` con stream MJPEG si se prefiere simplicidad | Visualización del video procesado |
| Estilos | TailwindCSS | Estilado rápido y consistente |
| Hosting | Vercel o Netlify (capa gratuita) | Despliegue del frontend estático |

### Comunicación Frontend ↔ Backend

- El backend expone:
  - `GET /cameras` → lista de cámaras detectadas en la PC.
  - `POST /session/start` → inicia sesión de grabación con la cámara seleccionada.
  - `POST /session/stop` → detiene la sesión y devuelve el conteo máximo alcanzado.
  - `WS /stream` → canal en tiempo real que envía: frame procesado (o solo metadatos de bounding boxes) + conteo actual.
- **Restricción de seguridad necesaria a definir:** dado que el frontend (HTTPS, dominio público) llamará a un backend local (`http://localhost`), debe configurarse **CORS** en FastAPI para permitir el origen del frontend desplegado, y considerar que los navegadores modernos pueden bloquear contenido mixto (HTTPS → HTTP local); puede requerirse servir el backend local también con un certificado autofirmado o usar `ws://localhost` explícitamente permitido.

---

## 5. ¿Cómo organizaré las carpetas?

Se utilizará **Clean Architecture**, separando el proyecto en dos grandes módulos (`backend` y `frontend`), y dentro del backend, en capas independientes con dependencias unidireccionales (las capas externas dependen de las internas, nunca al revés).

```
howmany/
├── especificaciones.md
├── README.md
│
├── backend/
│   ├── requirements.txt
│   ├── run.sh
│   ├── run.bat
│   └── src/
│       ├── main.py                         # Punto de entrada (arranca FastAPI/Uvicorn)
│       │
│       ├── domain/                         # CAPA 1: Reglas de negocio puras, sin dependencias externas
│       │   ├── entities/
│       │   │   ├── person_detection.py     # Entidad: PersonDetection
│       │   │   ├── recording_session.py    # Entidad: RecordingSession
│       │   │   └── camera_device.py        # Entidad: CameraDevice
│       │   ├── value_objects/
│       │   │   └── bounding_box.py         # Value Object: BoundingBox
│       │   └── repositories/               # Interfaces (puertos) que la infraestructura debe implementar
│       │       ├── camera_repository.py
│       │       └── person_detector.py
│       │
│       ├── application/                    # CAPA 2: Casos de uso, orquestan el dominio
│       │   ├── use_cases/
│       │   │   ├── list_available_cameras.py
│       │   │   ├── start_recording_session.py
│       │   │   ├── stop_recording_session.py
│       │   │   └── process_frame.py        # Detecta personas en un frame y actualiza el conteo
│       │   └── services/
│       │       └── person_counter_service.py
│       │
│       ├── infrastructure/                 # CAPA 3: Implementaciones concretas (detalles técnicos)
│       │   ├── detection/
│       │   │   └── yolo_person_detector.py # Implementa el puerto person_detector.py usando ultralytics YOLO
│       │   ├── camera/
│       │   │   └── opencv_camera_adapter.py # Implementa camera_repository.py usando OpenCV
│       │   └── streaming/
│       │       └── websocket_broadcaster.py
│       │
│       └── presentation/                   # CAPA 4: Entrada/salida HTTP y WebSocket
│           ├── api/
│           │   ├── routes.py                # Endpoints REST (/cameras, /session/start, /session/stop)
│           │   └── websocket_routes.py       # Endpoint WS (/stream)
│           └── schemas/
│               └── dto.py                    # Modelos Pydantic para requests/responses
│
└── frontend/
    ├── package.json
    ├── vercel.json (o netlify.toml)
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── VideoCanvas.tsx              # Dibuja el video + bounding boxes
        │   ├── CameraSelector.tsx            # Dropdown de cámaras disponibles
        │   ├── ControlButtons.tsx            # Botones Iniciar / Detener
        │   └── HistoryPanel.tsx              # Lista de sesiones (solo en memoria)
        ├── services/
        │   └── backendClient.ts              # Llamadas REST + conexión WebSocket al backend local
        ├── hooks/
        │   └── useRecordingSession.ts         # Maneja el estado de la sesión activa y el historial en memoria
        └── types/
            └── index.ts                       # Tipos TS equivalentes a los DTOs del backend
```

**Regla de dependencia (Clean Architecture):**
`presentation` → depende de → `application` → depende de → `domain`
`infrastructure` → implementa las interfaces definidas en → `domain`
El `domain` no importa nada de las otras capas.

---

## 6. ¿Qué entidades o clases principales necesito?

### Capa de Dominio (`domain/entities` y `domain/value_objects`)

**`BoundingBox`** (Value Object)
```python
x: float
y: float
width: float
height: float
```
Representa el rectángulo que encierra a una persona detectada en coordenadas del frame.

**`PersonDetection`** (Entidad)
```python
id: str                    # id de esta detección puntual, NO un identificador de persona (no hay tracking)
bounding_box: BoundingBox
confidence: float          # score de confianza del modelo (0.0 - 1.0)
timestamp: datetime
```
Representa una persona detectada en un frame específico. Cada detección es independiente entre frames: no se correlaciona con detecciones de frames anteriores ni posteriores.

**`Frame`** (Entidad, opcional si se necesita historial de frames)
```python
id: str
timestamp: datetime
detections: List[PersonDetection]
person_count: int          # len(detections), calculado
```

**`CameraDevice`** (Entidad)
```python
id: int                    # índice del dispositivo (ej. 0, 1, 2 para OpenCV)
name: str
is_active: bool
```

**`RecordingSession`** (Entidad — la más importante del dominio)
```python
id: str
camera_id: int
start_time: datetime
end_time: Optional[datetime]
status: SessionStatus      # Enum: ACTIVE | STOPPED
current_person_count: int  # personas presentes en el frame más reciente (vista en vivo)
max_person_count: int      # conteo máximo simultáneo alcanzado durante la sesión (se guarda en historial)
```
**Importante:** ninguno de estos contadores implica identidad de persona. `current_person_count` es simplemente `len(detections)` del frame actual. `max_person_count` es el mayor valor de `current_person_count` observado durante la sesión. No existe ningún campo de tipo `tracked_person_id` en ninguna entidad del sistema, ya que no se realiza tracking ni re-identificación.

**`SessionStatus`** (Enum)
```python
ACTIVE
STOPPED
```

### Interfaces / Puertos del dominio (`domain/repositories`)

**`PersonDetectorPort`** (interfaz abstracta)
```python
def detect(self, frame: np.ndarray) -> List[PersonDetection]: ...
```

**`CameraRepositoryPort`** (interfaz abstracta)
```python
def list_devices(self) -> List[CameraDevice]: ...
def capture_frame(self, camera_id: int) -> np.ndarray: ...
```

### Capa de Aplicación (`application`)

**`PersonCounterService`**
Orquesta: recibe un frame → llama a `PersonDetectorPort.detect()` → filtra solo detecciones de clase "person" → actualiza `RecordingSession.max_person_count` si el conteo actual lo supera → retorna las detecciones para dibujarlas.

**Casos de uso (`use_cases`)**
- `ListAvailableCamerasUseCase`
- `StartRecordingSessionUseCase`
- `StopRecordingSessionUseCase` → devuelve el `max_person_count` final de la sesión
- `ProcessFrameUseCase` → llamado en cada frame mientras la sesión está activa

### Capa de Infraestructura

**`YoloPersonDetector`** (implementa `PersonDetectorPort`)
Carga el modelo `yolov8n.pt`, ejecuta inferencia, filtra `class_id == 0`, y convierte las salidas de YOLO al formato `PersonDetection`/`BoundingBox` del dominio.

**`OpenCVCameraAdapter`** (implementa `CameraRepositoryPort`)
Usa `cv2.VideoCapture` para listar dispositivos disponibles y capturar frames.

### Frontend (equivalentes en TypeScript, sin lógica de negocio compleja)

- `Camera` (id, name)
- `SessionState` (status, currentCount, maxCount, startTime)
- `HistoryEntry` (sessionId, date, maxCount) — guardado solo en estado de React (memoria), se pierde al refrescar.

---

## 7. ¿Qué pantallas tendrá?

Una única pantalla principal con:
- Visualización del video en tiempo real con los recuadros dibujados sobre cada persona detectada.
- Selector (dropdown) de cámara, poblado con los dispositivos detectados por el backend local.
- Botón **Iniciar grabación** / **Detener grabación** (toggle).
- **Dos contadores visibles y claramente etiquetados, sin ambigüedad para el usuario:**
  - "Personas ahora: X" → conteo en tiempo real del frame actual.
  - "Máximo simultáneo en esta sesión: Y" → el valor más alto alcanzado durante la sesión activa.
- Panel de historial: lista de sesiones finalizadas en la sesión de navegador actual, mostrando el **máximo simultáneo** alcanzado en cada una (se pierde al recargar la página). Cada entrada del historial debe estar etiquetada como "Máximo simultáneo" para evitar que se interprete como un conteo acumulado de personas únicas.

---

## 8. ¿Qué reglas debe cumplir?

1. El sistema debe detectar y contar **únicamente personas** (clase `person`, id 0 en COCO); cualquier otra clase detectada por el modelo (animales, objetos, vehículos, etc.) debe ser descartada y no debe afectar el conteo ni dibujarse en el video.
2. **Alcance de la cámara (definición del límite de detección):**
   - El sistema solo cuenta personas que estén **completamente o parcialmente visibles dentro del cuadro de la cámara**; no se realiza ninguna estimación ni extrapolación de personas fuera del campo de visión.
   - No hay restricción de distancia mínima/máxima explícita: se cuentan todas las personas que el modelo logre detectar con una confianza mínima configurable (sugerido: `confidence >= 0.5`) dentro de la resolución del frame capturado.
   - Resolución de captura recomendada: 640x480 o 1280x720, balanceando precisión del modelo YOLO vs. rendimiento en tiempo real.
3. El sistema maneja dos valores de conteo distintos y debe diferenciarlos visualmente en el frontend en todo momento:
   - El **conteo actual** (personas presentes en el frame más reciente, sin tracking ni identidad).
   - El **conteo máximo simultáneo** de la sesión, que es el valor que se guarda en el historial. El frontend debe etiquetar este valor explícitamente (ej. "Máximo simultáneo") para que nunca se confunda con un conteo acumulado de personas únicas.
4. El procesamiento debe ejecutarse en tiempo real, con una meta de rendimiento de al menos 15 FPS en CPU (ajustable según hardware del usuario, usando el modelo `yolov8n` por ser el más liviano de la familia YOLOv8).
5. El backend debe ejecutarse exclusivamente en la máquina local del usuario, nunca debe enviar el video a un servidor de terceros ni almacenarlo en disco.

---

## 9. ¿Qué información debo guardar localmente?

- **No se persiste nada en disco ni en base de datos.**
- Lo único que se conserva de forma permanente es el **link público del frontend desplegado**.
- El historial de sesiones (conteo máximo por sesión) vive únicamente en el estado de memoria del navegador (React state) mientras la pestaña está abierta; se pierde al refrescar o cerrar la página.

---

## 10. ¿Cómo sabré que el proyecto está terminado?

El proyecto se considera terminado cuando:
- El frontend desplegado en la nube carga correctamente y se conecta sin errores al backend local.
- Los botones de iniciar/detener grabación funcionan correctamente y reflejan el estado real de la sesión.
- El selector de cámaras muestra correctamente los dispositivos detectados por la PC y permite cambiar entre ellos.
- El conteo de personas en pantalla es preciso (solo detecta personas, ningún otro objeto/animal) y los recuadros se dibujan correctamente alrededor de cada persona detectada, en tiempo real y sin demoras perceptibles.
- Al detener una sesión, el conteo máximo alcanzado se agrega correctamente al panel de historial visible en el frontend.
- El sistema cumple las reglas de la sección 8 sin excepciones observables durante pruebas manuales con distintas cantidades de personas en cuadro.
