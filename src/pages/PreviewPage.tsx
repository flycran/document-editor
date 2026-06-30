import { JSONContent } from '@tiptap/react'
import { Button, Modal } from 'antd'
import { useRef, useState } from 'react'
import { DocumentEditorEnumsProvider } from '@/components/DocumentEditor/contexts/DocumentEditorEnumsContext'
import Previewer, { PreviewerRef } from '@/components/DocumentPreviewer/DocumentPreviewer'

interface PreviewPageProps {
  content?: JSONContent
}

export default function PreviewPage({ content }: PreviewPageProps) {
  const previewerRef = useRef<PreviewerRef | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-800 m-0">文书预览</h1>
        <Button type="primary" size="small" onClick={() => setFormModalOpen(true)}>
          查看表单
        </Button>
        <Modal
          title="表单JSON内容"
          open={formModalOpen}
          onCancel={() => setFormModalOpen(false)}
          footer={null}
          destroyOnHidden
          width={800}
        >
          <pre className="whitespace-pre-wrap break-all bg-gray-50 p-4 rounded max-h-[60vh] overflow-auto text-sm">
            {JSON.stringify(previewerRef.current?.form.getFieldsValue(), null, 2)}
          </pre>
        </Modal>
      </div>
      <div className="flex-1 overflow-auto bg-white p-8">
        <DocumentEditorEnumsProvider>
          <Previewer ref={previewerRef} content={content} inputable />
        </DocumentEditorEnumsProvider>
      </div>
    </div>
  )
}
