import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from application.use_cases.start_recording_session import StartRecordingSessionUseCase
from application.use_cases.stop_recording_session import StopRecordingSessionUseCase
from infrastructure.camera.opencv_camera_adapter import OpenCVCameraAdapter
from infrastructure.detection.yolo_person_detector import YoloPersonDetector
from presentation.api.routes import make_router
from presentation.api.websocket_routes import make_ws_router

# ---------------------------------------------------------------------------
# Composición de dependencias
# ---------------------------------------------------------------------------
detector = YoloPersonDetector("yolov8n.pt")
camera_repo = OpenCVCameraAdapter()

start_session_uc = StartRecordingSessionUseCase()
stop_session_uc = StopRecordingSessionUseCase(camera_repo)

session_store: dict = {"active": None}

# ---------------------------------------------------------------------------
# Aplicación FastAPI
# ---------------------------------------------------------------------------
app = FastAPI(title="HowMany? Backend", version="2.0.0")

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(make_router(start_session_uc, stop_session_uc, session_store))
app.include_router(make_ws_router(detector, session_store))


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
