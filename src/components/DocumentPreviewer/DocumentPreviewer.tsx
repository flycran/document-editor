import { EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  DocumentVariableContext,
  DocumentVariableContextType,
} from '../DocumentEditor/contexts/DocumentVariableContext'
import { sharedExtensions } from '../DocumentEditor/extensions'
import tiptapStyles from '../DocumentEditor/styles.module.scss'

interface PreviewerProps {
  content?: JSONContent
  variable?: DocumentVariableContextType
}

export default function DocumentPreviewer({ content, variable }: PreviewerProps) {
  const editor = useEditor({
    extensions: [StarterKit, ...sharedExtensions],
    content,
    editable: false,
  })

  return (
    <div className={tiptapStyles['document-editor']}>
      <DocumentVariableContext value={{ variables: variable ?? {}, setVariables: () => {} }}>
        <EditorContent editor={editor} />
      </DocumentVariableContext>
    </div>
  )
}
