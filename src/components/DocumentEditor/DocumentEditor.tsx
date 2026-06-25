import Color from '@tiptap/extension-color'
import FontSize from '@tiptap/extension-font-size'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import {
  Editor,
  EditorContent,
  EditorEvents,
  EditorOptions,
  JSONContent,
  useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Drawer, Form } from 'antd'
import React from 'react'
import { documentPrint, getPreviewHTML } from '@/utils'
import VariableList, { VariableListProps } from '../VariableList/VariableList'
import { DocumentEditorContext, useDocumentEditor } from './contexts/DocumentEditorContext'
import EditorTour from './EditorTour/EditorTour'
import { sharedExtensions } from './extensions'
import { VariableExtensionMode } from './extensions/VariableExtension'
import './styles.scss'
import Toolbar from './Toolbar/Toolbar'
import './DocumentEditor.scss'
import { createStore, Provider, useAtomValue } from 'jotai'
import { Store } from 'jotai/vanilla/store'
import { editableAtom } from './DocumentEditorStore'

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
        body: 'variable-drawer',
      }}
    >
      <VariableList {...rest} mode={mode} dataTourId="variable-selector" />
    </Drawer>
  )
}

export type EditorRef = {
  editor: Editor
  print: () => void
  getPreviewHTML: () => string
}

type EditorListeners = Pick<
  EditorOptions,
  'onUpdate' | 'onFocus' | 'onBlur' | 'onMount' | 'onUnmount'
>
interface EditorProps extends Partial<EditorListeners> {
  /**
   * 占位符
   * @default '开始输入...'
   */
  placeholder?: string
  /** 保存 */
  onSave?: (parmas: { editor: Editor }) => void
  /** 编辑器内容 */
  content?: JSONContent
  /** 传递给变量列表组件的 props */
  variableListProps: Omit<VariableListProps, 'mode'>
  ref?: React.Ref<EditorRef>
  className?: string
}

export default function DocumentEditor({
  placeholder = '开始输入...',
  content,
  variableListProps,
  className,
  ref,
  onSave,
  ...listeners
}: EditorProps) {
  const storeRef = useRef<Store | null>(null)

  if (!storeRef.current) {
    storeRef.current = createStore()
    storeRef.current!.set(editableAtom, true)
  }
  const editorContentRef = useRef<HTMLDivElement | null>(null)
  const editor = useEditor(
    {
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
      ...listeners,
    },
    []
  )

  useEffect(() => {
    return () => {
      editor?.setOptions({
        content,
      })
    }
  }, [content])

  const editable = useAtomValue(editableAtom, { store: storeRef.current! })

  useEffect(() => {
    editor?.setEditable(editable)
  }, [editable, editor])

  const handlePrint = useCallback(() => {
    documentPrint(editorContentRef.current!)
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      editor,
      print: () => {
        documentPrint(editorContentRef.current!)
      },
      getPreviewHTML: () => getPreviewHTML(editorContentRef.current!),
    }),
    [editor]
  )

  const [form] = Form.useForm()

  const toolbar = useMemo(
    () => <Toolbar onPrint={handlePrint} onSave={() => form.submit()} />,
    [onSave]
  )

  const editorContent = useMemo(
    () => (
      <EditorContent
        ref={editorContentRef}
        editor={editor}
        data-tour-id="editor-content"
        className="document-content editor-only"
      />
    ),
    [editor]
  )

  return (
    <DocumentEditorContext value={editor}>
      <Provider store={storeRef.current}>
        <Form form={form} component={false}>
          <div className={clsx('editor-container', { 'document-editable': editable }, className)}>
            {toolbar}
            {editorContent}
            <VariableDrawer {...variableListProps} />
            <EditorTour />
          </div>
        </Form>
      </Provider>
    </DocumentEditorContext>
  )
}
