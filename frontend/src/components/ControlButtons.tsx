interface Props {
  isActive: boolean
  canStart: boolean
  onStart: () => void
  onStop: () => void
}

export function ControlButtons({ isActive, canStart, onStart, onStop }: Props) {
  if (isActive) {
    return (
      <button
        onClick={onStop}
        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-lg transition-colors"
      >
        Detener grabación
      </button>
    )
  }

  return (
    <button
      onClick={onStart}
      disabled={!canStart}
      className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Iniciar grabación
    </button>
  )
}
