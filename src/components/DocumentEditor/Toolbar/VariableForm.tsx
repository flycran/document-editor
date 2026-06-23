import type { JSONContent } from '@tiptap/core'
import { Button, DatePicker, Drawer, Form, Input, InputNumber, Switch, TimePicker } from 'antd'
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

function renderControl(attr: VariableNodeAttrs) {
  const placeholder = `请输入 ${attr.label}`
  switch (attr.type) {
    case 'boolean':
      return <Switch />
    case 'number':
      return <InputNumber placeholder={placeholder} style={{ width: '100%' }} />
    case 'date':
      return <DatePicker placeholder={placeholder} style={{ width: '100%' }} />
    case 'time':
      return <TimePicker placeholder={placeholder} style={{ width: '100%' }} />
    case 'date-time':
      return <DatePicker showTime placeholder={placeholder} style={{ width: '100%' }} />
    case 'text':
    default:
      return <Input placeholder={placeholder} allowClear />
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

  /** 日期/时间类型的 getValueFromEvent：dayjs → 格式化字符串 */
  const getDateStringFromEvent = (attr: VariableNodeAttrs) => {
    const format =
      attr.type === 'time'
        ? 'HH:mm:ss'
        : attr.type === 'date-time'
          ? 'YYYY-MM-DD HH:mm:ss'
          : 'YYYY-MM-DD'
    return (...args: any[]) => {
      const value = args[0]
      return dayjs.isDayjs(value) ? value.format(format) : value
    }
  }

  /** 日期/时间类型的 normalize：字符串 → dayjs（回填用） */
  const normalizeDateString = (value: any) => {
    if (!value) return value
    if (dayjs.isDayjs(value)) return value
    const d = dayjs(value)
    return d.isValid() ? d : value
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
          {variableNodeAttrs.map((attr) => {
            const isDateType =
              attr.type === 'date' || attr.type === 'time' || attr.type === 'date-time'
            return (
              <Form.Item
                key={attr.code}
                name={attr.code}
                label={attr.label}
                valuePropName={attr.type === 'boolean' ? 'checked' : undefined}
                {...(isDateType
                  ? {
                      getValueFromEvent: getDateStringFromEvent(attr),
                      normalize: normalizeDateString,
                    }
                  : {})}
              >
                {renderControl(attr)}
              </Form.Item>
            )
          })}
        </Form>
      )}
    </Drawer>
  )
}
