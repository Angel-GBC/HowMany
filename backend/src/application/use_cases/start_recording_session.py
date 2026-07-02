import uuid
from datetime import datetime

from domain.entities.recording_session import RecordingSession, SessionStatus


class StartRecordingSessionUseCase:

    def execute(self, camera_id: int) -> RecordingSession:
        return RecordingSession(
            id=str(uuid.uuid4()),
            camera_id=camera_id,
            start_time=datetime.now(),
            status=SessionStatus.ACTIVE,
        )
