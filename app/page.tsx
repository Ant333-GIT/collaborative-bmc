'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { generateToken } from '@/lib/tokens'
import AuthorModal from '@/components/AuthorModal'
import DeleteConfirm from '@/components/DeleteConfirm'

interface RecentCanvas {
  id: string
  title: string
  editToken: string
  createdBy: string
  updatedAt: number
}

export default function Home() {
  const router = useRouter()
  const [showAuthorModal, setShowAuthorModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'create' | { type: 'delete'; canvas: RecentCanvas } | null>(null)
  const [recent, setRecent] = useState<RecentCanvas[]>([])
  const [deleteTarget, setDeleteTarget] = useState<RecentCanvas | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('bmc_recent')
    if (stored) setRecent(JSON.parse(stored))
  }, [])

  function getAuthor(): string | null {
    return sessionStorage.getItem('bmc_author')
  }

  function handleCreate() {
    if (!getAuthor()) {
      setPendingAction('create')
      setShowAuthorModal(true)
    } else {
      doCreate(getAuthor()!)
    }
  }

  async function doCreate(author: string) {
    setLoading(true)
    const editToken = generateToken()
    const viewToken = generateToken()
    const { data, error } = await supabase
      .from('canvases')
      .insert({ title: 'Il mio Business Model Canvas', edit_token: editToken, view_token: viewToken, created_by: author })
      .select()
      .single()
    if (error || !data) { setLoading(false); alert('Errore creazione canvas'); return }
    addToRecent({ id: data.id, title: data.title, editToken, createdBy: author, updatedAt: Date.now() })
    router.push(`/canvas/${editToken}`)
  }

  function handleDelete(canvas: RecentCanvas) {
    if (!getAuthor()) {
      setPendingAction({ type: 'delete', canvas })
      setShowAuthorModal(true)
    } else {
      setDeleteTarget(canvas)
    }
  }

  async function doDelete(canvas: RecentCanvas, author: string) {
    if (canvas.createdBy && canvas.createdBy !== author) {
      alert(`Solo "${canvas.createdBy}" può eliminare questo canvas`)
      return
    }
    await supabase.from('canvases').delete().eq('id', canvas.id)
    const updated = recent.filter(c => c.id !== canvas.id)
    setRecent(updated)
    localStorage.setItem('bmc_recent', JSON.stringify(updated))
    setDeleteTarget(null)
  }

  function onAuthorConfirm(name: string) {
    sessionStorage.setItem('bmc_author', name)
    setShowAuthorModal(false)
    if (pendingAction === 'create') doCreate(name)
    else if (pendingAction && typeof pendingAction === 'object') setDeleteTarget(pendingAction.canvas)
    setPendingAction(null)
  }

  function addToRecent(entry: RecentCanvas) {
    const stored = JSON.parse(localStorage.getItem('bmc_recent') || '[]') as RecentCanvas[]
    const filtered = stored.filter(c => c.id !== entry.id)
    const updated = [entry, ...filtered].slice(0, 10)
    localStorage.setItem('bmc_recent', JSON.stringify(updated))
    setRecent(updated)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-5xl">🗂</div>
      <h1 className="text-3xl font-semibold tracking-tight">Business Model Canvas</h1>
      <p className="text-gray-500 text-center max-w-md leading-relaxed">
        Crea canvas collaborativi in tempo reale. Aggiungi note, condividi il link, lavora insieme al tuo team. Nessun account richiesto.
      </p>
      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Creazione...' : '+ Crea nuovo canvas'}
      </button>

      {recent.length > 0 && (
        <div className="w-full max-w-lg mt-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Canvas recenti</h3>
          <div className="flex flex-col gap-2">
            {recent.map(c => (
              <div key={c.id} className="flex items-center bg-white rounded-lg border border-gray-200 px-4 py-3 gap-3">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => router.push(`/canvas/${c.editToken}`)}
                >
                  <p className="font-medium text-sm truncate">{c.title || 'Senza titolo'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(c.updatedAt).toLocaleDateString('it')}
                    {c.createdBy && ` · ${c.createdBy}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(c)}
                  className="text-red-400 hover:text-red-600 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-red-50 transition flex-shrink-0"
                  title="Elimina canvas"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAuthorModal && (
        <AuthorModal onConfirm={onAuthorConfirm} onClose={() => { setShowAuthorModal(false); setPendingAction(null) }} />
      )}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={() => doDelete(deleteTarget, getAuthor()!)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}