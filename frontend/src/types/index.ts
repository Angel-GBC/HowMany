export interface Camera {
  id: string
  name: string
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

export interface DetectionPayload {
  bounding_boxes: BoundingBox[]
  current_count: number
  max_count: number
}

export interface SessionState {
  status: 'idle' | 'active' | 'stopped'
  sessionId: string | null
  currentCount: number
  maxCount: number
  startTime: string | null
}

export interface HistoryEntry {
  sessionId: string
  date: string
  maxCount: number
}
