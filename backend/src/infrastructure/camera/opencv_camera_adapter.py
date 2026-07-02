from typing import Dict, List

import cv2
import numpy as np

from domain.entities.camera_device import CameraDevice
from domain.repositories.camera_repository import CameraRepositoryPort

MAX_CAMERAS_TO_PROBE = 5


def _get_device_names() -> List[str]:
    try:
        from pygrabber.dshow_graph import FilterGraph
        return FilterGraph().get_input_devices()
    except Exception:
        return []


class OpenCVCameraAdapter(CameraRepositoryPort):

    def __init__(self) -> None:
        self._captures: Dict[int, cv2.VideoCapture] = {}

    def list_devices(self) -> List[CameraDevice]:
        device_names = _get_device_names()
        devices: List[CameraDevice] = []
        for index in range(MAX_CAMERAS_TO_PROBE):
            cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
            if cap.isOpened():
                if index < len(device_names):
                    name = device_names[index]
                else:
                    name = f"Cámara {index}"
                devices.append(CameraDevice(id=index, name=name))
                cap.release()
        return devices

    def capture_frame(self, camera_id: int) -> np.ndarray:
        if camera_id not in self._captures:
            cap = cv2.VideoCapture(camera_id, cv2.CAP_DSHOW)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            if not cap.isOpened():
                raise RuntimeError(f"No se pudo abrir la cámara {camera_id}")
            self._captures[camera_id] = cap

        ret, frame = self._captures[camera_id].read()
        if not ret:
            raise RuntimeError(f"No se pudo leer frame de cámara {camera_id}")
        return frame

    def release(self, camera_id: int) -> None:
        cap = self._captures.pop(camera_id, None)
        if cap is not None:
            cap.release()
