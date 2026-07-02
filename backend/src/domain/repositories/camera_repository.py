from abc import ABC, abstractmethod
from typing import List

import numpy as np

from domain.entities.camera_device import CameraDevice


class CameraRepositoryPort(ABC):

    @abstractmethod
    def list_devices(self) -> List[CameraDevice]:
        ...

    @abstractmethod
    def capture_frame(self, camera_id: int) -> np.ndarray:
        ...

    @abstractmethod
    def release(self, camera_id: int) -> None:
        ...
