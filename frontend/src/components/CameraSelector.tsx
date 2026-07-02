import type { Camera } from '../types'

interface Props {
  cameras: Camera[]
  selectedId: string | null
  disabled: boolean
  onSelect: (id: string) => void
  onRefresh: () => void
}

export function CameraSelector({ cameras, selectedId, disabled, onSelect, onRefresh }: Props) {
  return (
    <div className="flex items-center gap-2">
      <select
        disabled={disabled}
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="flex-1 rounded-lg border border-gray-600 bg-gray-800 text-white px-3 py-2 disabled:opacity-50"
      >
        <option value="" disabled>Selecciona una cámara</option>
        {cameras.map((cam) => (
          <option key={cam.id} value={cam.id}>{cam.name}</option>
        ))}
      </select>
      <button
        onClick={onRefresh}
        disabled={disabled}
        className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm disabled:opacity-50"
      >
        Actualizar
      </button>
    </div>
  )
}
