from typing import List, Tuple

import numpy as np

from application.services.person_counter_service import PersonCounterService
from domain.entities.person_detection import PersonDetection
from domain.entities.recording_session import RecordingSession
from domain.repositories.camera_repository import CameraRepositoryPort


class ProcessFrameUseCase:

    def __init__(
        self,
        camera_repo: CameraRepositoryPort,
        counter_service: PersonCounterService,
    ) -> None:
        self._camera_repo = camera_repo
        self._counter_service = counter_service

    def execute(
        self, session: RecordingSession
    ) -> Tuple[np.ndarray, List[PersonDetection], int]:
        frame = self._camera_repo.capture_frame(session.camera_id)
        detections, count = self._counter_service.process_frame(frame, session)
        return frame, detections, count
