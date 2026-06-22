import Color from '@tiptap/extension-color'
import FontSize from '@tiptap/extension-font-size'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Editor, EditorContent, EditorEvents, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Drawer } from 'antd'
import React from 'react'
import VariableList, { VariableListProps } from '../VariableList/VariableList'
import { DocumentEditorContext, useDocumentEditor } from './contexts/DocumentEditorContext'
import { DocumentVariableContext } from './contexts/DocumentVariableContext'
import { PreviewModeContext } from './contexts/PreviewModeContext'
import editorStyles from './DocumentEditor.module.scss'
import EditorTour, { isTourCompleted } from './EditorTour/EditorTour'
import { sharedExtensions } from './extensions'
import { VariableExtensionMode } from './extensions/VariableExtension'
import tiptapStyles from './styles.module.scss'
import Toolbar from './Toolbar/Toolbar'

/**
 * 编辑器专用：placeholder 样式
 */

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
      classNames={{
        body: editorStyles['variable-drawer'],
      }}
    >
      <VariableList {...rest} mode={mode} dataTourId="variable-selector" />
    </Drawer>
  )
}

interface EditorProps {
  /**
   * 占位符
   * @default '开始输入...'
   */
  placeholder?: string
  /** 编辑器内容 */
  content?: JSONContent
  /** 更新编辑器内容 */
  onUpdate?: (json: JSONContent) => void
  /** 编辑器 ref */
  ref?: React.Ref<Editor | null>
  /** 传递给变量列表组件的 props */
  variableListProps: Omit<VariableListProps, 'mode'>
}

export default function DocumentEditor({
  placeholder = '开始输入...',
  content,
  variableListProps,
  onUpdate,
  ref,
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
      onUpdate?.(editor.getJSON())
    },
  })

  const [isPreview, setIsPreview] = useState(false)
  const [previewVariables, setPreviewVariables] = useState<Record<string, any>>({})
  const [tourOpen, setTourOpen] = useState(() => !isTourCompleted())

  useEffect(() => {
    editor?.setEditable(!isPreview)
  }, [isPreview, editor])

  useImperativeHandle(ref, () => editor)

  return (
    <DocumentEditorContext value={editor}>
      <PreviewModeContext value={{ isPreview, setPreview: setIsPreview }}>
        <DocumentVariableContext
          value={{ variables: previewVariables, setVariables: setPreviewVariables }}
        >
          <div className={clsx({ 'document-editable': !isPreview })}>
            <Toolbar />
            <div
              data-tour-id="editor-content"
              className={clsx(tiptapStyles['document-editor'], editorStyles['editor-only'])}
            >
              <EditorContent editor={editor} />
            </div>
            <VariableDrawer {...variableListProps} />
            <EditorTour open={tourOpen} onClose={() => setTourOpen(false)} />
          </div>
        </DocumentVariableContext>
      </PreviewModeContext>
    </DocumentEditorContext>
  )
}
