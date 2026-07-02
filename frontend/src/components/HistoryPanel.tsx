import type { HistoryEntry } from '../types'

interface Props {
  entries: HistoryEntry[]
}

export function HistoryPanel({ entries }: Props) {
  return (
    <div className="rounded-xl bg-gray-800 p-4">
      <h2 className="text-white font-semibold mb-3">Historial de sesiones</h2>
      {entries.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay sesiones finalizadas aún.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.sessionId}
              className="flex justify-between items-center bg-gray-700 rounded-lg px-3 py-2"
            >
              <span className="text-gray-300 text-sm">{entry.date}</span>
              <span className="text-white text-sm font-medium">
                Máximo simultáneo:{' '}
                <span className="text-blue-400 font-bold">{entry.maxCount}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-gray-600 text-xs mt-3">
        El historial se pierde al recargar la página.
      </p>
    </div>
  )
}
