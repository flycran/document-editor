import { Editor, EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Ref } from 'react'
import { documentPrint, getPreviewHTML } from '@/utils'
import { sharedExtensions } from '../DocumentEditor/extensions'
import '../DocumentEditor/styles.scss'
import { Form } from 'antd'
import { createStore, Provider } from 'jotai'
import { Store } from 'jotai/vanilla/store'
import { inputableAtom } from '../DocumentEditor/DocumentEditorStore'

export type PreviewRef = {
  editor: Editor
  print: () => void
  getPreviewHTML: () => string
}

interface PreviewerProps {
  /* 预览的文档内容 */
  content?: JSONContent
  /* 变量上下文 */
  formData?: any
  /** 是否允许在预览模式下输入变量 */
  inputable?: boolean
  className?: string
  ref?: Ref<PreviewRef>
}

export default function DocumentPreviewer({
  content,
  formData,
  inputable,
  className,
  ref,
}: PreviewerProps) {
  const storeRef = useRef<Store | null>(null)

  if (!storeRef.current) {
    storeRef.current = createStore()
  }

  useEffect(() => {
    storeRef.current!.set(inputableAtom, !!inputable)
  }, [inputable])

  const editorContentRef = useRef<HTMLDivElement | null>(null)
  const editor = useEditor({
    extensions: [StarterKit, ...sharedExtensions],
    content,
    editable: false,
  })

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

  useEffect(() => {
    form.setFieldsValue(formData)
  }, [formData])

  return (
    <Provider store={storeRef.current}>
      <div>
        <Form form={form} component={false}>
          <EditorContent
            ref={editorContentRef}
            editor={editor}
            className={clsx('document-content', className)}
          />
        </Form>
      </div>
    </Provider>
  )
}
