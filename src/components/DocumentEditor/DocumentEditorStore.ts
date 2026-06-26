import { atom } from 'jotai'
import { isTourCompleted } from './EditorTour/EditorTour'

/** 允许编辑 */
export const editableAtom = atom(false)

export const STORAGE_KEY = 'editor-tour-completed'
/** 开启引导 */
export const tourOpenAtom = atom(!isTourCompleted())

/** 允许输入变量 */
export const inputableAtom = atom(false)
