from typing import List, Tuple

import numpy as np

from domain.entities.person_detection import PersonDetection
from domain.entities.recording_session import RecordingSession
from domain.repositories.person_detector import PersonDetectorPort


class PersonCounterService:

    def __init__(self, detector: PersonDetectorPort) -> None:
        self._detector = detector

    def process_frame(
        self, frame: np.ndarray, session: RecordingSession
    ) -> Tuple[List[PersonDetection], int]:
        detections = self._detector.detect(frame)
        count = len(detections)
        session.update_count(count)
        return detections, count
