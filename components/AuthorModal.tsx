'use client'

import { useRef, useState } from 'react'

interface Props {
  title?: string
  subtitle?: string
  onConfirm: (name: string) => void
  onClose: () => void
}

export default function AuthorModal({ title = 'Come ti chiami?', subtitle = 'Il tuo nome apparirà sulle note che crei. Ogni collaboratore inserisce il proprio.', onConfirm, onClose }: Props) {
  const [value, setValue] = useState(sessionStorage.getItem('bmc_author') || '')
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function confirm() {
    const v = value.trim()
    if (!v) { setError(true); inputRef.current?.focus(); return }
    onConfirm(v)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-7 w-full max-w-sm flex flex-col gap-4 shadow-xl">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">{subtitle}</p>
        </div>
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={e => { setValue(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && confirm()}
          placeholder="Il tuo nome"
          maxLength={40}
          className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-gray-400'}`}
        />
        {error && <p className="text-xs text-red-400 -mt-2">Il nome è obbligatorio</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
            Annulla
          </button>
          <button onClick={confirm} className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition">
            Continua
          </button>
        </div>
      </div>
    </div>
  )
}