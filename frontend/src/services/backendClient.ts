import type { Camera, DetectionPayload } from '../types'

const BACKEND_URL = ((import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8000').replace(/\/$/, '')
const WS_URL = BACKEND_URL.replace(/^http/, 'ws')

export async function listCamerasFromBrowser(): Promise<Camera[]> {
  try {
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
    tempStream.getTracks().forEach((t) => t.stop())
  } catch {
    return []
  }
  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices
    .filter((d) => d.kind === 'videoinput')
    .map((d, i) => ({ id: d.deviceId, name: d.label || `Cámara ${i}` }))
}

export async function startSession(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ camera_id: 0 }),
  })
  if (!res.ok) throw new Error('Error al iniciar sesión')
  const data = await res.json() as { session_id: string }
  return data.session_id
}

export async function stopSession(): Promise<number> {
  const res = await fetch(`${BACKEND_URL}/session/stop`, { method: 'POST' })
  if (!res.ok) throw new Error('Error al detener sesión')
  const data = await res.json() as { max_person_count: number }
  return data.max_person_count
}

export function createDetectionStream(
  onDetection: (payload: DetectionPayload) => void,
  onOpen?: () => void,
  onError?: () => void,
): WebSocket {
  const ws = new WebSocket(`${WS_URL}/stream`)
  ws.binaryType = 'arraybuffer'
  ws.onopen = () => onOpen?.()
  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data as string) as DetectionPayload
      onDetection(payload)
    } catch {
      // frame malformado, ignorar
    }
  }
  ws.onerror = () => onError?.()
  return ws
}
