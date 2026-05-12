'use client'

interface Props {
  title: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirm({ title, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-7 w-full max-w-sm flex flex-col gap-4 shadow-xl">
        <h3 className="text-base font-semibold">Elimina canvas</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Sei sicuro di voler eliminare <strong>"{title}"</strong>? Tutte le note verranno cancellate. L'azione è irreversibile.
        </p>
        <div className="flex gap-2 mt-1">
          <button onClick={onCancel} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
            Annulla
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 transition">
            Elimina
          </button>
        </div>
      </div>
    </div>
  )
}