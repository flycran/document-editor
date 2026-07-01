import { Editor } from '@tiptap/react'
import { Form, Input, Modal, message } from 'antd'
import { useEffect, useState } from 'react'
import { convertContent } from '@/utils/importCompat/utils'

interface ImportExportModalProps {
  open: boolean
  editor: Editor
  onClose: () => void
}

/**
 * 导入模态框：输入 HTML 文本，点击确定后写入编辑器
 */
export default function ImportExportModal({ open, editor, onClose }: ImportExportModalProps) {
  const [value, setValue] = useState('')
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (open) {
      setValue('')
    }
  }, [open])

  const handleOk = async () => {
    setImporting(true)
    const content = await convertContent(value)
    try {
      editor
        .chain()
        .focus()
        .setContent(content || '')
        .run()
      onClose()
    } finally {
      setImporting(false)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData || (window as any).clipboardData
    const html = clipboardData.getData('text/html')
    if (html) {
      message.info('检测到 HTML 内容，已优先粘贴')
      setValue(html)
      e.preventDefault()
    }
  }

  return (
    <Modal
      title="导入文档"
      width={700}
      open={open}
      onOk={handleOk}
      onCancel={importing ? undefined : onClose}
      destroyOnHidden
      confirmLoading={importing}
      cancelButtonProps={{
        disabled: importing,
      }}
      okText="确定"
      cancelText="取消"
    >
      <Form.Item
        help="粘贴 HTML/JSON 文本，导入后将替换当前文档内容。支持直接粘贴旧文书内容，自动转换为新格式"
        style={{ marginBottom: 0 }}
      >
        <Input.TextArea
          onPaste={handlePaste}
          autoFocus
          autoSize={{ minRows: 8, maxRows: 16 }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="请输入 HTML/JSON 文本"
        />
      </Form.Item>
    </Modal>
  )
}
