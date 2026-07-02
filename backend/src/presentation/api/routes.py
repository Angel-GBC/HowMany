from fastapi import APIRouter, HTTPException

from application.use_cases.start_recording_session import StartRecordingSessionUseCase
from application.use_cases.stop_recording_session import StopRecordingSessionUseCase
from presentation.schemas.dto import (
    StartSessionRequest,
    StartSessionResponse,
    StopSessionResponse,
)

router = APIRouter()


def make_router(
    start_session_uc: StartRecordingSessionUseCase,
    stop_session_uc: StopRecordingSessionUseCase,
    session_store: dict,
) -> APIRouter:

    @router.post("/session/start", response_model=StartSessionResponse)
    def start_session(body: StartSessionRequest):
        if session_store.get("active"):
            raise HTTPException(status_code=409, detail="Ya hay una sesión activa.")
        session = start_session_uc.execute(body.camera_id)
        session_store["active"] = session
        return StartSessionResponse(
            session_id=session.id,
            camera_id=session.camera_id,
            status=session.status.value,
        )

    @router.post("/session/stop", response_model=StopSessionResponse)
    def stop_session():
        session = session_store.get("active")
        if not session:
            raise HTTPException(status_code=404, detail="No hay ninguna sesión activa.")
        max_count = stop_session_uc.execute(session)
        session_store["active"] = None
        return StopSessionResponse(
            session_id=session.id,
            max_person_count=max_count,
            status=session.status.value,
        )

    return router
