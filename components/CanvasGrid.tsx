'use client'

import { useState } from 'react'
import { Note, SECTIONS } from '@/lib/types'
import NoteCard from './NoteCard'

interface Props {
  notes: Note[]
  currentAuthor: string
  isViewer: boolean
  onAddNote: (section: string) => Promise<void>
  onUpdateNote: (id: string, changes: Partial<Note>) => Promise<void>
  onDeleteNote: (id: string) => Promise<void>
  onMoveNote: (noteId: string, targetSection: string) => Promise<void>
}

export default function CanvasGrid({ notes, currentAuthor, isViewer, onAddNote, onUpdateNote, onDeleteNote, onMoveNote }: Props) {
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  function notesFor(sid: string) {
    return notes.filter(n => n.section === sid)
  }

  async function handleDrop(e: React.DragEvent, targetSid: string) {
    e.preventDefault()
    setDragOver(null)
    if (!draggingId) return
    await onMoveNote(draggingId, targetSid)
    setDraggingId(null)
  }

  return (
    <div className="bmc-grid" id="bmc-grid">
      {SECTIONS.map(sec => (
        <div
          key={sec.id}
          className={`bmc-${sec.id} bg-white border border-gray-200 rounded-xl p-2.5 flex flex-col gap-1.5 transition-colors ${dragOver === sec.id ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(sec.id) }}
          onDragLeave={() => setDragOver(null)}
          onDrop={e => handleDrop(e, sec.id)}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{sec.label}</span>
            {!isViewer && (
              <button
                onClick={() => onAddNote(sec.id)}
                className="w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-sm flex items-center justify-center leading-none transition opacity-0 group-hover:opacity-100"
                style={{ opacity: undefined }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '')}
                title="Aggiungi nota"
              >
                +
              </button>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5 flex-1">
            {notesFor(sec.id).map(note => (
              <NoteCard
                key={note.id}
                note={note}
                currentAuthor={currentAuthor}
                isViewer={isViewer}
                onUpdate={changes => onUpdateNote(note.id, changes)}
                onDelete={() => onDeleteNote(note.id)}
                onDragStart={() => setDraggingId(note.id)}
                onDragEnd={() => setDraggingId(null)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}