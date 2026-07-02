from dataclasses import dataclass
from datetime import datetime

from domain.value_objects.bounding_box import BoundingBox


@dataclass
class PersonDetection:
    id: str
    bounding_box: BoundingBox
    confidence: float
    timestamp: datetime
