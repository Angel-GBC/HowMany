from dataclasses import dataclass


@dataclass
class CameraDevice:
    id: int
    name: str
    is_active: bool = False
