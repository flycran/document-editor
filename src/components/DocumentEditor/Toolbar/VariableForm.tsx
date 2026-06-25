import type { JSONContent } from '@tiptap/core'
import { Button, DatePicker, Drawer, Form, Input, InputNumber, Switch } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useDocumentEditor } from '../contexts/DocumentEditorContext'
import { VariableNodeAttrs } from '../extensions/VariableNode/VariableNode'

interface VariableFormProps {
  open: boolean
  onClose: () => void
}

function extractVariableAttrs(doc: JSONContent) {
  const result: VariableNodeAttrs[] = []
  const codes = new Set<string>()

  function walk(node: JSONContent) {
    if (node.type === 'variable' && node.attrs?.code) {
      const attrs = node.attrs as VariableNodeAttrs
      if (!codes.has(attrs.code)) {
        codes.add(attrs.code)
        result.push(attrs)
      }
    }
    if (node.content) {
      for (const child of node.content) {
        walk(child)
      }
    }
  }

  walk(doc)
  return result
}

/** 日期/时间类型各自的格式化字符串；表单始终存储字符串，不存 dayjs 对象 */
const DATE_FORMAT_MAP: Record<string, string> = {
  date: 'YYYY-MM-DD',
  time: 'HH:mm:ss',
  'date-time': 'YYYY-MM-DD HH:mm:ss',
}

/**
 * 日期/时间包装控件：在 dayjs（控件所需）与字符串（表单所存）之间转换。
 * Form 字段始终持有字符串，dayjs 只存在于控件边界，不会进入表单数据。
 */
function DateTimeField({
  format,
  showTime,
  picker,
  placeholder,
  value,
  onChange,
}: {
  format: string
  showTime?: boolean
  picker?: 'time'
  placeholder?: string
  value?: string
  onChange?: (value: string | undefined) => void
}) {
  const dayjsValue = useMemo(() => {
    if (!value) return undefined
    const d = dayjs(value, format)
    return d.isValid() ? d : undefined
  }, [value, format])

  return (
    <DatePicker
      picker={picker}
      showTime={showTime}
      format={format}
      placeholder={placeholder}
      style={{ width: '100%' }}
      value={dayjsValue}
      onChange={(d) => onChange?.(d ? d.format(format) : undefined)}
    />
  )
}

function renderItem(attr: VariableNodeAttrs) {
  const placeholder = `请输入 ${attr.label}`
  const common = { key: attr.code, name: attr.code, label: attr.label }

  switch (attr.type) {
    case 'boolean':
      return (
        <Form.Item {...common} valuePropName="checked">
          <Switch />
        </Form.Item>
      )
    case 'number':
      return (
        <Form.Item {...common}>
          <InputNumber placeholder={placeholder} style={{ width: '100%' }} />
        </Form.Item>
      )
    case 'date':
    case 'date-time':
      return (
        <Form.Item {...common}>
          <DateTimeField
            format={DATE_FORMAT_MAP[attr.type]}
            showTime={attr.type === 'date-time'}
            placeholder={placeholder}
          />
        </Form.Item>
      )
    case 'time':
      return (
        <Form.Item {...common}>
          <DateTimeField format={DATE_FORMAT_MAP.time} picker="time" placeholder={placeholder} />
        </Form.Item>
      )
    case 'text':
    default:
      return (
        <Form.Item {...common}>
          <Input placeholder={placeholder} allowClear />
        </Form.Item>
      )
  }
}

export default function VariableForm({ open, onClose }: VariableFormProps) {
  const editor = useDocumentEditor()
  const globalForm = Form.useFormInstance()
  const [form] = Form.useForm()

  const variableNodeAttrs = useMemo(() => {
    if (!editor) return []
    return extractVariableAttrs(editor.getJSON())
  }, [editor, open])

  const handleFinish = (values: Record<string, any>) => {
    globalForm.setFieldsValue(values)
    onClose()
  }

  useEffect(() => {
    if (open) {
      form.setFieldsValue(globalForm.getFieldsValue())
    }
  }, [open])

  return (
    <Drawer
      title="预览变量"
      size={700}
      open={open}
      onClose={onClose}
      data-tour-id="variable-form-drawer"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={() => form.submit()}>
            应用预览
          </Button>
        </div>
      }
    >
      {variableNodeAttrs.length === 0 ? (
        <div style={{ color: '#999', textAlign: 'center', padding: 40 }}>
          文档中暂无变量，请先在编辑器中插入变量
        </div>
      ) : (
        <Form form={form} initialValues={globalForm.getFieldsValue()} onFinish={handleFinish}>
          {variableNodeAttrs.map((attr) => renderItem(attr))}
        </Form>
      )}
    </Drawer>
  )
}
