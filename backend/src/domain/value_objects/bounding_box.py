from dataclasses import dataclass


@dataclass(frozen=True)
class BoundingBox:
    x: float
    y: float
    width: float
    height: float
