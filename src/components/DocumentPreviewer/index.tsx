import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { sharedExtensions } from '../DocumentEditor/extensions'
import { tiptapStyles } from '../DocumentEditor/styles'

interface PreviewerProps {
  content?: string
}

export default function DocumentPreviewer({ content = '' }: PreviewerProps) {
  const editor = useEditor({
    extensions: [StarterKit, ...sharedExtensions],
    content,
    editable: false,
  })

  return (
    <div className={tiptapStyles}>
      <EditorContent editor={editor} />
    </div>
  )
}
