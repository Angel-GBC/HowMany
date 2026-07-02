from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class SessionStatus(Enum):
    ACTIVE = "ACTIVE"
    STOPPED = "STOPPED"


@dataclass
class RecordingSession:
    id: str
    camera_id: int
    start_time: datetime
    status: SessionStatus = SessionStatus.ACTIVE
    current_person_count: int = 0
    max_person_count: int = 0
    end_time: Optional[datetime] = None

    def update_count(self, count: int) -> None:
        self.current_person_count = count
        if count > self.max_person_count:
            self.max_person_count = count

    def stop(self) -> None:
        self.status = SessionStatus.STOPPED
        self.end_time = datetime.now()
