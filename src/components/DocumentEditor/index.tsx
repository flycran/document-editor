import { css, cx } from '@emotion/css'
import Color from '@tiptap/extension-color'
import FontSize from '@tiptap/extension-font-size'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Editor, EditorContent, EditorEvents, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Drawer } from 'antd'
import React from 'react'
import VariableList, { VariableListProps } from '../VariableList/VariableList'
import { DocumentEditorContext, useDocumentEditor } from './contexts/DocumentEditorContext'
import {
  DocumentVariableContext,
  DocumentVariableContextType,
} from './contexts/DocumentVariableContext'
import { PreviewModeContext } from './contexts/PreviewModeContext'
import { sharedExtensions } from './extensions'
import { VariableExtensionMode } from './extensions/VariableExtension'
import { tiptapStyles } from './styles'
import Toolbar from './Toolbar/Toolbar'

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

interface VariableDrawerProps extends Omit<VariableListProps, 'mode'> {}

function VariableDrawer({ ...rest }: VariableDrawerProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<VariableExtensionMode>('insert')
  const editor = useDocumentEditor()

  useEffect(() => {
    if (!editor) return
    const handleChange = ({ open, mode }: EditorEvents['variableExtension:change']) => {
      setOpen(open)
      setMode(mode)
    }
    editor.on('variableExtension:change', handleChange)
    return () => {
      editor.off('variableExtension:change', handleChange)
    }
  }, [editor])

  return (
    <Drawer
      size={600}
      open={open}
      onClose={() => {
        editor.commands.closeVariableDrawer()
      }}
    >
      <VariableList {...rest} mode={mode} />
    </Drawer>
  )
}

const editorStyles = cx(tiptapStyles, editorOnlyStyles)

interface EditorProps {
  placeholder?: string
  content?: string
  onUpdate?: (html: string) => void
  ref?: React.Ref<Editor | null>
  variable?: DocumentVariableContextType
  variableListProps: Omit<VariableListProps, 'mode'>
}

export default function DocumentEditor({
  placeholder = '开始输入...',
  content = '',
  variable,
  variableListProps,
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

  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    editor?.setEditable(!isPreview)
  }, [isPreview, editor])

  useImperativeHandle(ref, () => editor)

  return (
    <DocumentEditorContext value={editor}>
      <PreviewModeContext value={{ isPreview, setPreview: setIsPreview }}>
        <div>
          <Toolbar />
          <div className={editorStyles}>
            <DocumentVariableContext value={variable ?? {}}>
              <EditorContent editor={editor} />
            </DocumentVariableContext>
          </div>
          <VariableDrawer {...variableListProps} />
        </div>
      </PreviewModeContext>
    </DocumentEditorContext>
  )
}
