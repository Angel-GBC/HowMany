import { useCallback, useRef, useState } from 'react'
import {
  createDetectionStream,
  listCamerasFromBrowser,
  startSession,
  stopSession,
} from '../services/backendClient'
import type { BoundingBox, Camera, HistoryEntry, SessionState } from '../types'

const INITIAL_SESSION: SessionState = {
  status: 'idle',
  sessionId: null,
  currentCount: 0,
  maxCount: 0,
  startTime: null,
}

const FRAME_INTERVAL_MS = 50

export function useRecordingSession(videoRef: React.RefObject<HTMLVideoElement>) {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [session, setSession] = useState<SessionState>(INITIAL_SESSION)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [detections, setDetections] = useState<BoundingBox[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const frameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const captureCanvas = useRef<HTMLCanvasElement>(document.createElement('canvas'))

  const loadCameras = useCallback(async () => {
    const list = await listCamerasFromBrowser()
    setCameras(list)
    return list
  }, [])

  const sendFrame = useCallback(() => {
    const video = videoRef.current
    const ws = wsRef.current
    const canvas = captureCanvas.current

    if (!video || !ws || ws.readyState !== WebSocket.OPEN || video.videoWidth === 0) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (blob && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(blob)
        }
      },
      'image/jpeg',
      0.7,
    )
  }, [videoRef])

  const start = useCallback(
    async (cameraId: string) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: cameraId ? { exact: cameraId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const sessionId = await startSession()
      sessionIdRef.current = sessionId
      setSession({
        status: 'active',
        sessionId,
        currentCount: 0,
        maxCount: 0,
        startTime: new Date().toISOString(),
      })

      const ws = createDetectionStream(
        (payload) => {
          setDetections(payload.bounding_boxes)
          setSession((prev) => ({
            ...prev,
            currentCount: payload.current_count,
            maxCount: payload.max_count,
          }))
        },
        () => {
          const loop = () => {
            sendFrame()
            frameTimerRef.current = setTimeout(loop, FRAME_INTERVAL_MS)
          }
          loop()
        },
      )
      wsRef.current = ws
    },
    [videoRef, sendFrame],
  )

  const stop = useCallback(async () => {
    if (frameTimerRef.current) {
      clearTimeout(frameTimerRef.current)
      frameTimerRef.current = null
    }
    wsRef.current?.close()
    wsRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null

    const maxCount = await stopSession()
    const sessionId = sessionIdRef.current
    sessionIdRef.current = null

    if (sessionId) {
      setHistory((h) => [
        { sessionId, date: new Date().toLocaleString('es'), maxCount },
        ...h,
      ])
    }
    setSession({ ...INITIAL_SESSION, status: 'stopped' })
    setDetections([])
  }, [])

  return { cameras, session, history, detections, loadCameras, start, stop }
}
