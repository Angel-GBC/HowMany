from typing import List
from pydantic import BaseModel


class StartSessionRequest(BaseModel):
    camera_id: int = 0


class StartSessionResponse(BaseModel):
    session_id: str
    camera_id: int
    status: str


class StopSessionResponse(BaseModel):
    session_id: str
    max_person_count: int
    status: str


class BoundingBoxDTO(BaseModel):
    x: float
    y: float
    width: float
    height: float
    confidence: float


class DetectionPayload(BaseModel):
    bounding_boxes: List[BoundingBoxDTO]
    current_count: int
    max_count: int
