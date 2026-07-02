from abc import ABC, abstractmethod
from typing import List

import numpy as np

from domain.entities.person_detection import PersonDetection


class PersonDetectorPort(ABC):

    @abstractmethod
    def detect(self, frame: np.ndarray) -> List[PersonDetection]:
        ...
