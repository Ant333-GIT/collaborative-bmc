'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Canvas, Note } from '@/lib/types'
import CanvasGrid from '@/components/CanvasGrid'

export default function ViewPage() {
  const { viewToken } = useParams<{ viewToken: string }>()
  const router = useRouter()
  const [canvas, setCanvas] = useState<Canvas | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!viewToken) return
    load()
  }, [viewToken])

  useEffect(() => {
    if (!canvas) return
    const channel = supabase
      .channel(`view:${canvas.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `canvas_id=eq.${canvas.id}` },
        payload => {
          if (payload.eventType === 'INSERT') setNotes(n => [...n, payload.new as Note])
          if (payload.eventType === 'UPDATE') setNotes(n => n.map(x => x.id === (payload.new as Note).id ? payload.new as Note : x))
          if (payload.eventType === 'DELETE') setNotes(n => n.filter(x => x.id !== (payload.old as Note).id))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [canvas?.id])

  async function load() {
    const { data: cv } = await supabase.from('canvases').select('*').eq('view_token', viewToken).single()
    if (!cv) { router.push('/'); return }
    setCanvas(cv)
    const { data: ns } = await supabase.from('notes').select('*').eq('canvas_id', cv.id).order('position')
    setNotes(ns || [])
    setLoading(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Caricamento...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-900 text-white px-4 py-2.5 flex items-center gap-3 sticky top-0 z-50">
        <span className="text-sm font-semibold flex-1 truncate">{canvas?.title}</span>
        <span className="text-xs bg-white/10 px-2 py-1 rounded">👁 Sola lettura</span>
      </header>
      <main className="flex-1 overflow-auto p-3">
        <CanvasGrid
          notes={notes}
          currentAuthor=""
          isViewer={true}
          onAddNote={async () => {}}
          onUpdateNote={async () => {}}
          onDeleteNote={async () => {}}
          onMoveNote={async () => {}}
        />
      </main>
    </div>
  )
}