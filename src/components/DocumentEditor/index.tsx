import { css, cx } from '@emotion/css'
import Color from '@tiptap/extension-color'
import FontSize from '@tiptap/extension-font-size'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React from 'react'
import { DocumentEditorContext } from './contexts/DocumentEditorContext'
import { sharedExtensions } from './extensions'
import { tiptapStyles } from './styles'
import Toolbar from './Toolbar'

/**
 * 编辑器专用：placeholder 样式
 */
export const editorOnlyStyles = css`
  .tiptap {
    min-height: 300px;

    p.is-editor-empty:first-child::before {
      color: #adb5bd;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
`

const editorStyles = cx(tiptapStyles, editorOnlyStyles)

interface EditorProps {
  placeholder?: string
  content?: string
  children?: React.ReactNode
  onUpdate?: (html: string) => void
  ref?: React.Ref<Editor | null>
}

export default function DocumentEditor({
  placeholder = '开始输入...',
  content = '',
  children,
  onUpdate,
  ref,
}: EditorProps) {
  const extensions = [
    StarterKit,
    Placeholder.configure({ placeholder }),
    TextStyle,
    FontSize,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Color,
    Highlight.configure({ multicolor: true }),
    ...sharedExtensions,
  ]
  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML())
    },
  })

  useImperativeHandle(ref, () => editor)

  return (
    <DocumentEditorContext value={editor}>
      <div>
        <Toolbar />
        <div className={editorStyles}>
          <EditorContent editor={editor} />
        </div>
        {children}
      </div>
    </DocumentEditorContext>
  )
}
