import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { PageBreak } from '../Editor/extensions/PageBreak'
import { tiptapStyles } from '../Editor/styles'

interface PreviewerProps {
  content?: string
}

export default function Previewer({ content = '' }: PreviewerProps) {
  const editor = useEditor({
    extensions: [StarterKit, PageBreak],
    content,
    editable: false,
  })

  return (
    <div className={tiptapStyles}>
      <EditorContent editor={editor} />
    </div>
  )
}
