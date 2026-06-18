import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { sharedExtensions } from '../Editor/extensions'
import { tiptapStyles } from '../Editor/styles'

interface PreviewerProps {
  content?: string
}

export default function Previewer({ content = '' }: PreviewerProps) {
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
