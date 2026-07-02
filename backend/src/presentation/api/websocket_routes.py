import asyncio

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from infrastructure.detection.yolo_person_detector import YoloPersonDetector

ws_router = APIRouter()


def make_ws_router(
    detector: YoloPersonDetector,
    session_store: dict,
) -> APIRouter:

    @ws_router.websocket("/stream")
    async def stream(websocket: WebSocket):
        await websocket.accept()
        try:
            while True:
                data = await websocket.receive_bytes()

                nparr = np.frombuffer(data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if frame is None:
                    continue

                loop = asyncio.get_event_loop()
                detections = await loop.run_in_executor(None, detector.detect, frame)
                count = len(detections)

                session = session_store.get("active")
                if session:
                    session.update_count(count)
                    max_count = session.max_person_count
                else:
                    max_count = 0

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

                await websocket.send_json({
                    "bounding_boxes": boxes,
                    "current_count": count,
                    "max_count": max_count,
                })

        except WebSocketDisconnect:
            pass

    return ws_router
