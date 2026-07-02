import uuid
from datetime import datetime
from typing import List

import numpy as np

from domain.entities.person_detection import PersonDetection
from domain.repositories.person_detector import PersonDetectorPort
from domain.value_objects.bounding_box import BoundingBox

PERSON_CLASS_ID = 0
CONFIDENCE_THRESHOLD = 0.65


class YoloPersonDetector(PersonDetectorPort):

    def __init__(self, model_name: str = "yolov8n.pt") -> None:
        from ultralytics import YOLO
        self._model = YOLO(model_name)

    def detect(self, frame: np.ndarray) -> List[PersonDetection]:
        results = self._model(frame, verbose=False)[0]
        detections: List[PersonDetection] = []
        now = datetime.now()

        for box in results.boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            if cls != PERSON_CLASS_ID or conf < CONFIDENCE_THRESHOLD:
                continue

            x1, y1, x2, y2 = box.xyxy[0].tolist()
            detections.append(
                PersonDetection(
                    id=str(uuid.uuid4()),
                    bounding_box=BoundingBox(
                        x=x1,
                        y=y1,
                        width=x2 - x1,
                        height=y2 - y1,
                    ),
                    confidence=conf,
                    timestamp=now,
                )
            )

        return detections
