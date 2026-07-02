from domain.entities.recording_session import RecordingSession
from domain.repositories.camera_repository import CameraRepositoryPort


class StopRecordingSessionUseCase:

    def __init__(self, camera_repo: CameraRepositoryPort) -> None:
        self._camera_repo = camera_repo

    def execute(self, session: RecordingSession) -> int:
        session.stop()
        self._camera_repo.release(session.camera_id)
        return session.max_person_count
