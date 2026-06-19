import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  DocumentVariableContext,
  DocumentVariableContextType,
} from '../DocumentEditor/contexts/DocumentVariableContext'
import { sharedExtensions } from '../DocumentEditor/extensions'
import { tiptapStyles } from '../DocumentEditor/styles'

interface PreviewerProps {
  content?: string
  variable?: DocumentVariableContextType
}

export default function DocumentPreviewer({ content = '', variable }: PreviewerProps) {
  const editor = useEditor({
    extensions: [StarterKit, ...sharedExtensions],
    content,
    editable: false,
  })

  return (
    <div className={tiptapStyles}>
      <DocumentVariableContext value={variable ?? {}}>
        <EditorContent editor={editor} />
      </DocumentVariableContext>
    </div>
  )
}
