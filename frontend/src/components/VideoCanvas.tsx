import { useEffect, useRef } from 'react'
import type { BoundingBox } from '../types'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  detections: BoundingBox[]
}

export function VideoCanvas({ videoRef, detections }: Props) {
  const overlayRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const video = videoRef.current
    if (!overlay) return

    const ctx = overlay.getContext('2d')
    if (!ctx) return

    overlay.width = overlay.clientWidth
    overlay.height = overlay.clientHeight
    ctx.clearRect(0, 0, overlay.width, overlay.height)

    if (!detections.length || !video || video.videoWidth === 0) return

    const scaleX = overlay.clientWidth / video.videoWidth
    const scaleY = overlay.clientHeight / video.videoHeight

    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = '#00ff00'

    for (const d of detections) {
      const x = d.x * scaleX
      const y = d.y * scaleY
      const w = d.width * scaleX
      const h = d.height * scaleY
      ctx.strokeRect(x, y, w, h)
      ctx.fillText(`Persona ${Math.round(d.confidence * 100)}%`, x + 2, y > 16 ? y - 4 : y + 16)
    }
  }, [detections, videoRef])

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      {!detections.length && (
        <p className="absolute bottom-3 left-3 text-gray-500 text-xs select-none">
          Sin detecciones
        </p>
      )}
    </div>
  )
}
