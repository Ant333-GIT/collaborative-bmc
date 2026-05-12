'use client'

import { useState } from 'react'

interface Props {
  editToken: string
  viewToken: string
  onClose: () => void
}

export default function ShareModal({ editToken, viewToken, onClose }: Props) {
  const [copiedEdit, setCopiedEdit] = useState(false)
  const [copiedView, setCopiedView] = useState(false)
  const base = typeof window !== 'undefined' ? window.location.origin : ''

  function copy(url: string, which: 'edit' | 'view') {
    navigator.clipboard.writeText(url)
    if (which === 'edit') { setCopiedEdit(true); setTimeout(() => setCopiedEdit(false), 2000) }
    else { setCopiedView(true); setTimeout(() => setCopiedView(false), 2000) }
  }

  const editUrl = `${base}/canvas/${editToken}`
  const viewUrl = `${base}/view/${viewToken}`

  return (
    <div className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-7 w-full max-w-md flex flex-col gap-5 shadow-xl">
        <h3 className="text-base font-semibold">Condividi canvas</h3>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-500">Link modificabile — per collaboratori</label>
          <div className="flex gap-2">
            <input readOnly value={editUrl} className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 outline-none" />
            <button onClick={() => copy(editUrl, 'edit')} className={`text-xs px-3 py-2 rounded-lg border transition ${copiedEdit ? 'bg-green-50 border-green-300 text-green-600' : 'border-gray-200 hover:bg-gray-50'}`}>
              {copiedEdit ? '✓ Copiato' : 'Copia'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-500">Link sola lettura</label>
          <div className="flex gap-2">
            <input readOnly value={viewUrl} className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 outline-none" />
            <button onClick={() => copy(viewUrl, 'view')} className={`text-xs px-3 py-2 rounded-lg border transition ${copiedView ? 'bg-green-50 border-green-300 text-green-600' : 'border-gray-200 hover:bg-gray-50'}`}>
              {copiedView ? '✓ Copiato' : 'Copia'}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-700 transition self-center mt-1">
          Chiudi
        </button>
      </div>
    </div>
  )
}