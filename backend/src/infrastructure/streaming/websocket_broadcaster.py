import asyncio
import base64
import json
from typing import List

import cv2
import numpy as np

from domain.entities.person_detection import PersonDetection


class WebSocketBroadcaster:

    @staticmethod
    def build_payload(
        frame: np.ndarray,
        detections: List[PersonDetection],
        current_count: int,
        max_count: int,
    ) -> str:
        annotated = _draw_boxes(frame, detections)
        _, buffer = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 70])
        frame_b64 = base64.b64encode(buffer).decode("utf-8")

        boxes = [
            {
                "x": d.bounding_box.x,
                "y": d.bounding_box.y,
                "width": d.bounding_box.width,
                "height": d.bounding_box.height,
                "confidence": d.confidence,
            }
            for d in detections
        ]

        return json.dumps(
            {
                "frame": frame_b64,
                "bounding_boxes": boxes,
                "current_count": current_count,
                "max_count": max_count,
            }
        )


def _draw_boxes(frame: np.ndarray, detections: List[PersonDetection]) -> np.ndarray:
    annotated = frame.copy()
    for d in detections:
        bb = d.bounding_box
        x1, y1 = int(bb.x), int(bb.y)
        x2, y2 = int(bb.x + bb.width), int(bb.y + bb.height)
        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)
        label = f"Persona {d.confidence * 100:.0f}%"
        cv2.putText(
            annotated, label, (x1, y1 - 6),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1,
        )
    return annotated
