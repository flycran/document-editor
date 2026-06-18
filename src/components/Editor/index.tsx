import { cx } from '@emotion/css'
import Color from '@tiptap/extension-color'
import FontSize from '@tiptap/extension-font-size'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { sharedExtensions } from './extensions'
import { editorOnlyStyles, tiptapStyles } from './styles'
import Toolbar from './Toolbar'

const editorStyles = cx(tiptapStyles, editorOnlyStyles)

interface EditorProps {
  placeholder?: string
  content?: string
  onUpdate?: (html: string) => void
}

export default function Editor({
  placeholder = '开始输入...',
  content = '',
  onUpdate,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      TextStyle,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      Highlight.configure({ multicolor: true }),
      ...sharedExtensions,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div>
      <Toolbar editor={editor} />
      <div className={editorStyles}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
