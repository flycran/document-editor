import { Button, Modal } from 'antd'
import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import Previewer, { PreviewRef } from '@/components/DocumentPreviewer/DocumentPreviewer'
import { useGetEnumsQueryHook } from '@/hooks/useGetEnumsQueryHook'
import { OutletContext } from '@/types/router'

export default function PreviewPage() {
  const { content } = useOutletContext<OutletContext>()
  const previewerRef = useRef<PreviewRef | null>(null)
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
          width={800}
        >
          <pre className="whitespace-pre-wrap break-all bg-gray-50 p-4 rounded max-h-[60vh] overflow-auto text-sm">
            {JSON.stringify(content, null, 2)}
          </pre>
        </Modal>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <Previewer
          ref={previewerRef}
          content={content}
          inputable
          getEnumsQuery={useGetEnumsQueryHook}
        />
      </div>
    </div>
  )
}
