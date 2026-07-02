import { useCallback, useEffect, useRef, useState } from 'react'
import { CameraSelector } from './components/CameraSelector'
import { ControlButtons } from './components/ControlButtons'
import { HistoryPanel } from './components/HistoryPanel'
import { VideoCanvas } from './components/VideoCanvas'
import { useRecordingSession } from './hooks/useRecordingSession'

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { cameras, session, history, detections, loadCameras, start, stop } =
    useRecordingSession(videoRef)

  const [selectedCamera, setSelectedCamera] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLoadCameras = useCallback(async () => {
    setError(null)
    try {
      const list = await loadCameras()
      if (list.length > 0 && selectedCamera === null) {
        setSelectedCamera(list[0].id)
      }
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
    }
  }, [loadCameras, selectedCamera])

  useEffect(() => {
    handleLoadCameras()
  }, [])

  const handleStart = async () => {
    if (!selectedCamera) return
    setError(null)
    try {
      await start(selectedCamera)
    } catch {
      setError('No se pudo conectar al backend. Verifica que el servidor esté corriendo.')
    }
  }

  const isActive = session.status === 'active'

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">HowMany?</h1>
        <p className="text-gray-400 text-sm mt-1">Conteo de personas en tiempo real</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <VideoCanvas videoRef={videoRef} detections={detections} />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Personas ahora</p>
              <p className="text-5xl font-bold text-green-400">{session.currentCount}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Máximo simultáneo en esta sesión
              </p>
              <p className="text-5xl font-bold text-blue-400">{session.maxCount}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700 rounded-xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <CameraSelector
            cameras={cameras}
            selectedId={selectedCamera}
            disabled={isActive}
            onSelect={setSelectedCamera}
            onRefresh={handleLoadCameras}
          />

          <ControlButtons
            isActive={isActive}
            canStart={selectedCamera !== null && cameras.length > 0}
            onStart={handleStart}
            onStop={stop}
          />
        </div>

        <div className="lg:col-span-1">
          <HistoryPanel entries={history} />
        </div>
      </div>
    </div>
  )
}
