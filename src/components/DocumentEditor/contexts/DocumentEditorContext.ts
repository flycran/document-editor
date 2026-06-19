import { Editor } from '@tiptap/react'

export const DocumentEditorContext = createContext<Editor | null>(null)

export const useDocumentEditor = () => {
  const editor = useContext(DocumentEditorContext)

  if (!editor) {
    throw new Error('useDocumentEditor must be used within a DocumentEditorProvider')
  }

  return editor
}
