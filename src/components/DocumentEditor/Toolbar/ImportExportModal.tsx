import { Editor } from '@tiptap/react'
import { Form, Input, Modal } from 'antd'
import { useEffect, useState } from 'react'
import { convertOldFormat, isOldFormat } from '@/utils/importCompat'

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

  useEffect(() => {
    if (open) {
      setValue('')
    }
  }, [open])

  const handleOk = () => {
    const getContent = () => {
      try {
        return JSON.parse(value)
      } catch (e) {
        return value
      }
    }
    const content = getContent()
    // 兼容旧格式：检测 { rich_text, rich_config } 并转换
    const finalContent = isOldFormat(content) ? convertOldFormat(content) : content
    editor
      .chain()
      .focus()
      .setContent(finalContent || '<p></p>')
      .run()
    onClose()
  }

  return (
    <Modal
      title="导入文档"
      width={700}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnHidden
      okText="确定"
      cancelText="取消"
    >
      <Form.Item
        help="粘贴 HTML/JSON 文本，导入后将替换当前文档内容。支持直接粘贴旧文书响应，自动转换为新格式"
        style={{ marginBottom: 0 }}
      >
        <Input.TextArea
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
