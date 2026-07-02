from typing import List

from domain.entities.camera_device import CameraDevice
from domain.repositories.camera_repository import CameraRepositoryPort


class ListAvailableCamerasUseCase:

    def __init__(self, camera_repo: CameraRepositoryPort) -> None:
        self._camera_repo = camera_repo

    def execute(self) -> List[CameraDevice]:
        return self._camera_repo.list_devices()
