'use client'

import { useRef, useState } from 'react'
import { Note, NoteColor, NOTE_COLORS } from '@/lib/types'
import AuthorModal from './AuthorModal'

interface Props {
  note: Note
  currentAuthor: string
  isViewer: boolean
  onUpdate: (changes: Partial<Note>) => Promise<void>
  onDelete: () => Promise<void>
  onDragStart: () => void
  onDragEnd: () => void
}

export default function NoteCard({ note, currentAuthor, isViewer, onUpdate, onDelete, onDragStart, onDragEnd }: Props) {
  const isOwner = !isViewer && currentAuthor === note.author
  const [showUnlock, setShowUnlock] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [dragging, setDragging] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  const canEdit = isOwner || unlocked

  function handleInput() {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onUpdate({ content: contentRef.current?.textContent || '' })
    }, 400)
  }

  function handleColor(color: NoteColor) {
    onUpdate({ color })
  }

  function onUnlockConfirm(name: string) {
    sessionStorage.setItem('bmc_author', name)
    setShowUnlock(false)
    if (name === note.author) {
      setUnlocked(true)
    } else {
      alert(`Nome non corrispondente — questa nota è di "${note.author}"`)
    }
  }

  return (
    <>
      <div
        className={`${note.color} rounded-lg px-2.5 py-2 text-[13px] leading-snug border border-black/5 relative group transition-opacity ${dragging ? 'note-dragging' : ''}`}
        draggable={canEdit}
        onDragStart={() => { if (canEdit) { setDragging(true); onDragStart() } }}
        onDragEnd={() => { setDragging(false); onDragEnd() }}
        onClick={() => { if (!isViewer && !isOwner && !unlocked) setShowUnlock(true) }}
        style={{ cursor: canEdit ? 'grab' : isViewer ? 'default' : 'pointer' }}
        title={!isOwner && !isViewer && !unlocked ? `Nota di ${note.author} — clicca per verificare` : undefined}
      >
        {/* Content */}
        <div
          ref={contentRef}
          contentEditable={canEdit}
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); contentRef.current?.blur() } }}
          className="outline-none min-h-[1.2em] whitespace-pre-wrap break-words"
          style={{ cursor: canEdit ? 'text' : 'inherit' }}
        >
          {note.content}
        </div>

        {/* Author badge */}
        <div className="flex items-center gap-1 mt-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOwner || unlocked ? 'bg-green-400' : 'bg-gray-300'}`} />
          <span className="text-[10px] text-gray-400">
            {note.author}
            {(isOwner || unlocked) && <span className="text-green-500 ml-1">(tu)</span>}
          </span>
        </div>

        {/* Actions (only for owner/unlocked) */}
        {canEdit && (
          <div className="hidden group-hover:flex group-focus-within:flex items-center gap-1 flex-wrap mt-2">
            {NOTE_COLORS.map(c => (
              <button
                key={c.cls}
                onClick={() => handleColor(c.cls)}
                className="w-3.5 h-3.5 rounded-full border border-black/10 hover:scale-110 transition-transform flex-shrink-0"
                style={{ background: c.hex }}
                title={c.label}
              />
            ))}
            <button
              onClick={onDelete}
              className="ml-auto text-[10px] text-gray-300 hover:text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded transition"
            >
              ✕ elimina
            </button>
          </div>
        )}
      </div>

      {showUnlock && (
        <AuthorModal
          title="Sei l'autore di questa nota?"
          subtitle={`Inserisci il tuo nome. Se corrisponde a "${note.author}" potrai modificarla.`}
          onConfirm={onUnlockConfirm}
          onClose={() => setShowUnlock(false)}
        />
      )}
    </>
  )
}