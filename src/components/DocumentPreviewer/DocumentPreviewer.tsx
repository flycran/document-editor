import { Editor, EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Ref } from 'react'
import { documentPrint, getPreviewHTML } from '@/utils'
import { sharedExtensions } from '../DocumentEditor/extensions'
import '../DocumentEditor/styles.scss'
import { ConfigProvider, Form, FormInstance } from 'antd'
import { createStore, Provider } from 'jotai'
import { Store } from 'jotai/vanilla/store'
import { DocumentEditorEnumsContext } from '../DocumentEditor/contexts/DocumentEditorEnumsContext'
import { inputableAtom } from '../DocumentEditor/DocumentEditorStore'

export type PreviewerRef = {
  editor: Editor
  print: () => void
  form: FormInstance
  getPreviewHTML: () => string
}

export interface PreviewerProps {
  /* 预览的文档内容 */
  content?: JSONContent
  /* 变量上下文 */
  formData?: any
  /** 是否允许在预览模式下输入变量 */
  inputable?: boolean
  /* 获取枚举列表接口 */
  getEnumsQuery?: DocumentEditorEnumsContext
  className?: string
  ref?: Ref<PreviewerRef>
}

export default function DocumentPreviewer({
  content,
  formData,
  inputable,
  getEnumsQuery,
  className,
  ref,
}: PreviewerProps) {
  const storeRef = useRef<Store | null>(null)

  const _getEnumsQuery = useContext(DocumentEditorEnumsContext)

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
      form: form,
      getPreviewHTML: () => getPreviewHTML(editorContentRef.current!),
    }),
    [editor]
  )

  const [form] = Form.useForm()

  useEffect(() => {
    form.setFieldsValue(formData)
  }, [formData])

  return (
    <ConfigProvider>
      <Provider store={storeRef.current}>
        <DocumentEditorEnumsContext value={getEnumsQuery || _getEnumsQuery}>
          <div>
            <Form form={form} component={false} initialValues={formData}>
              <EditorContent
                ref={editorContentRef}
                editor={editor}
                className={clsx('document-content', className)}
              />
            </Form>
          </div>
        </DocumentEditorEnumsContext>
      </Provider>
    </ConfigProvider>
  )
}
