import { JSONContent } from '@tiptap/react'

export interface OutletContext {
  content: JSONContent
  setContent: (content: JSONContent) => void
}
