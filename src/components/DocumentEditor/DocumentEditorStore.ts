import { atom } from 'jotai'
import { isTourCompleted } from './EditorTour/EditorTour'

export const editableAtom = atom(false)

export const STORAGE_KEY = 'editor-tour-completed'
export const tourOpenAtom = atom(!isTourCompleted())
