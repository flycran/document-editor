import { Editor, EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Ref } from 'react'
import { documentPrint, getPreviewHTML } from '@/utils'
import {
  DocumentVariableContext,
  DocumentVariableContextType,
} from '../DocumentEditor/contexts/DocumentVariableContext'
import { sharedExtensions } from '../DocumentEditor/extensions'
import '../DocumentEditor/styles.scss'

export type PreviewRef = {
  editor: Editor
  print: () => void
  getPreviewHTML: () => string
}

interface PreviewerProps {
  /* 预览的文档内容 */
  content?: JSONContent
  /* 变量上下文 */
  variable?: DocumentVariableContextType
  className?: string
  ref?: Ref<PreviewRef>
}

export default function DocumentPreviewer({ content, variable, className, ref }: PreviewerProps) {
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

  return (
    <div>
      <DocumentVariableContext value={{ variables: variable ?? {}, setVariables: () => {} }}>
        <EditorContent
          ref={editorContentRef}
          editor={editor}
          className={clsx('document-editor', 'document-print-area', className)}
        />
      </DocumentVariableContext>
    </div>
  )
}
