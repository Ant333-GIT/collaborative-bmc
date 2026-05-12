'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Canvas, Note } from '@/lib/types'
import CanvasGrid from '@/components/CanvasGrid'
import AuthorModal from '@/components/AuthorModal'
import ShareModal from '@/components/ShareModal'

export default function CanvasPage() {
  const { editToken } = useParams<{ editToken: string }>()
  const router = useRouter()
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [author, setAuthor] = useState<string>('')
  const [showAuthorModal, setShowAuthorModal] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [loading, setLoading] = useState(true)
  const titleTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const stored = sessionStorage.getItem('bmc_author')
    if (stored) setAuthor(stored)
    else setShowAuthorModal(true)
  }, [])

  useEffect(() => {
    if (!editToken) return
    loadCanvas()
  }, [editToken])

  useEffect(() => {
    if (!canvas) return
    const channel = supabase
      .channel(`canvas:${canvas.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `canvas_id=eq.${canvas.id}` },
        payload => {
          if (payload.eventType === 'INSERT') setNotes(n => [...n, payload.new as Note])
          if (payload.eventType === 'UPDATE') setNotes(n => n.map(x => x.id === (payload.new as Note).id ? payload.new as Note : x))
          if (payload.eventType === 'DELETE') setNotes(n => n.filter(x => x.id !== (payload.old as Note).id))
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'canvases', filter: `id=eq.${canvas.id}` },
        payload => setCanvas(payload.new as Canvas)
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [canvas?.id])

  async function loadCanvas() {
    setLoading(true)
    const { data: cv } = await supabase.from('canvases').select('*').eq('edit_token', editToken).single()
    if (!cv) { router.push('/'); return }
    setCanvas(cv)
    const { data: ns } = await supabase.from('notes').select('*').eq('canvas_id', cv.id).order('position')
    setNotes(ns || [])
    setLoading(false)
  }

  async function updateTitle(title: string) {
    if (!canvas) return
    clearTimeout(titleTimer.current)
    titleTimer.current = setTimeout(async () => {
      await supabase.from('canvases').update({ title }).eq('id', canvas.id)
      // update localStorage recent
      const stored = JSON.parse(localStorage.getItem('bmc_recent') || '[]')
      const updated = stored.map((c: { id: string; title: string }) => c.id === canvas.id ? { ...c, title, updatedAt: Date.now() } : c)
      localStorage.setItem('bmc_recent', JSON.stringify(updated))
    }, 400)
  }

  async function addNote(section: string) {
    if (!canvas || !author) return
    const position = notes.filter(n => n.section === section).length
    // Insert only — Realtime will add it to state via the subscription
    await supabase.from('notes').insert({
      canvas_id: canvas.id, section, content: '', color: 'nc-yellow', author, position
    })
  }

  async function updateNote(id: string, changes: Partial<Note>) {
    // Optimistic update locally
    setNotes(n => n.map(x => x.id === id ? { ...x, ...changes } : x))
    await supabase.from('notes').update(changes).eq('id', id)
  }

  async function deleteNote(id: string) {
    // Optimistic remove locally
    setNotes(n => n.filter(x => x.id !== id))
    await supabase.from('notes').delete().eq('id', id)
  }

  async function moveNote(noteId: string, targetSection: string) {
    const note = notes.find(n => n.id === noteId)
    if (!note || note.section === targetSection) return
    const position = notes.filter(n => n.section === targetSection).length
    await supabase.from('notes').update({ section: targetSection, position }).eq('id', noteId)
  }

  async function exportJSON() {
    const blob = new Blob([JSON.stringify({ canvas, notes }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${canvas?.title || 'canvas'}.json`; a.click()
  }

  async function exportPNG() {
    const { default: html2canvas } = await import('html2canvas')
    const el = document.getElementById('bmc-grid')
    if (!el) return
    const c = await html2canvas(el, { scale: 2, backgroundColor: '#f5f4f0', useCORS: true })
    const a = document.createElement('a'); a.href = c.toDataURL('image/png')
    a.download = `${canvas?.title || 'canvas'}.png`; a.click()
  }

  function onAuthorConfirm(name: string) {
    sessionStorage.setItem('bmc_author', name)
    setAuthor(name)
    setShowAuthorModal(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Caricamento canvas...</div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.push('/')} className="text-sm font-semibold text-gray-400 hover:text-gray-700 transition px-2 py-1 rounded hover:bg-gray-100">
          ← BMC
        </button>
        <input
          defaultValue={canvas?.title}
          onChange={e => updateTitle(e.target.value)}
          className="flex-1 min-w-0 text-sm font-semibold bg-transparent outline-none focus:bg-gray-100 rounded px-2 py-1"
          placeholder="Titolo canvas"
        />
        {author && (
          <span className="text-xs text-gray-400 hidden sm:block">
            👤 {author}
          </span>
        )}
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setShowShare(true)} className="text-xs border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition">🔗 Condividi</button>
          <button onClick={exportJSON} className="text-xs border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition">↓ JSON</button>
          <button onClick={exportPNG} className="text-xs border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition">↓ PNG</button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-3">
        <CanvasGrid
          notes={notes}
          currentAuthor={author}
          isViewer={false}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
          onMoveNote={moveNote}
        />
      </main>

      {showAuthorModal && <AuthorModal onConfirm={onAuthorConfirm} onClose={() => setShowAuthorModal(false)} />}
      {showShare && canvas && (
        <ShareModal
          editToken={canvas.edit_token}
          viewToken={canvas.view_token}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}