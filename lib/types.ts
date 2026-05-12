export type NoteColor =
  | 'nc-yellow'
  | 'nc-green'
  | 'nc-blue'
  | 'nc-pink'
  | 'nc-orange'
  | 'nc-purple'
  | 'nc-white'

export type SectionId =
  | 'kp' | 'ka' | 'kr' | 'vp'
  | 'cr' | 'ch' | 'cs'
  | 'cost' | 'rev' | 'bs'

export interface Section {
  id: SectionId
  label: string
  gridClass: string
}

export interface Canvas {
  id: string
  title: string
  edit_token: string
  view_token: string
  created_by: string
  created_at: string
}

export interface Note {
  id: string
  canvas_id: string
  section: SectionId
  content: string
  color: NoteColor
  author: string
  position: number
  created_at: string
  updated_at: string
}

export const SECTIONS: Section[] = [
  { id: 'kp',   label: 'Key Partners',          gridClass: 'col-span-2 row-span-2' },
  { id: 'ka',   label: 'Key Activities',         gridClass: 'col-span-2 row-span-1' },
  { id: 'kr',   label: 'Key Resources',          gridClass: 'col-span-2 row-span-1' },
  { id: 'vp',   label: 'Value Propositions',     gridClass: 'col-span-2 row-span-2' },
  { id: 'cr',   label: 'Customer Relationships', gridClass: 'col-span-2 row-span-1' },
  { id: 'ch',   label: 'Channels',               gridClass: 'col-span-2 row-span-1' },
  { id: 'cs',   label: 'Customer Segments',      gridClass: 'col-span-2 row-span-2' },
  { id: 'cost', label: 'Cost Structure',         gridClass: 'col-span-5 row-span-1' },
  { id: 'rev',  label: 'Revenue Streams',        gridClass: 'col-span-5 row-span-1' },
  { id: 'bs',   label: '🧠 Brainstorming',       gridClass: 'col-span-10 row-span-1' },
]

export const NOTE_COLORS: { cls: NoteColor; hex: string; label: string }[] = [
  { cls: 'nc-yellow', hex: '#fffde7', label: 'Giallo' },
  { cls: 'nc-green',  hex: '#e8f5e9', label: 'Verde' },
  { cls: 'nc-blue',   hex: '#e3f2fd', label: 'Blu' },
  { cls: 'nc-pink',   hex: '#fce4ec', label: 'Rosa' },
  { cls: 'nc-orange', hex: '#fff3e0', label: 'Arancio' },
  { cls: 'nc-purple', hex: '#f3e5f5', label: 'Viola' },
  { cls: 'nc-white',  hex: '#ffffff', label: 'Bianco' },
]