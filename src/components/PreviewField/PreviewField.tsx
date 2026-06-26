import { DatePicker, Form, Input, InputRef, Select } from 'antd'
import './PreviewField.scss'
import { useAtomValue } from 'jotai'
import { GrCheckbox, GrCheckboxSelected } from 'react-icons/gr'
import { DocumentEditorEnumsContext } from '../DocumentEditor/contexts/DocumentEditorEnumsContext'
import { inputableAtom } from '../DocumentEditor/DocumentEditorStore'
import { VariableType } from '../DocumentEditor/extensions/VariableNode/VariableNode'

interface TextProps {
  value?: unknown
}

function Text({ value }: TextProps) {
  if (value == null || value === '') return null
  // 防御：表单值可能是 dayjs 等非字符串对象，统一转字符串，避免 React 渲染对象崩溃
  return typeof value === 'string' ? value : String(value)
}

interface PreviewFieldBaseProps {
  value: unknown
  onSetSize: (size: number) => void
  children?: React.ReactNode
}

function PreviewFieldBase({ value = '', onSetSize, children }: PreviewFieldBaseProps) {
  const measureRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (measureRef.current) {
      onSetSize(measureRef.current.offsetWidth)
    }
  }, [value])

  return (
    <span className="preview-field-base">
      <span ref={measureRef} className="measure">
        {String(value)}
      </span>
      {children}
    </span>
  )
}

interface PreviewFieldInputProps {
  value: any
  onChange?: (value: any) => void
}

function PreviewFieldInput({ value, ...rest }: PreviewFieldInputProps) {
  const inputRef = useRef<InputRef>(null)

  const handleSetSize = useCallback((size: number) => {
    if (inputRef.current) {
      inputRef.current.input!.style.width = `${size}px`
    }
  }, [])

  return (
    <PreviewFieldBase value={value} onSetSize={handleSetSize}>
      <Input value={value} {...rest} className="input" ref={inputRef} />
    </PreviewFieldBase>
  )
}

type DatePickerRef = React.ComponentRef<typeof DatePicker>

interface PreviewFieldDatePickerProps {
  value: any
  onChange?: (value: any) => void
  type: 'date' | 'date-time' | 'time'
}

function PreviewFieldDatePicker({ value, onChange, type, ...rest }: PreviewFieldDatePickerProps) {
  const date = useMemo(() => (value ? dayjs(value) : undefined), [value])

  const datePickerRef = useRef<DatePickerRef>(null)

  useEffect(() => {
    console.log(datePickerRef)
  }, [])

  const handleSetSize = useCallback((size: number) => {
    if (datePickerRef.current) {
      datePickerRef.current.nativeElement.querySelector<HTMLInputElement>('.input')!.style.width =
        `${size}px`
    }
  }, [])

  return (
    <PreviewFieldBase value={value} onSetSize={handleSetSize}>
      <DatePicker
        ref={datePickerRef}
        className="input-wrapper"
        classNames={{
          input: 'input data-picker',
        }}
        picker={type === 'time' ? 'time' : 'date'}
        value={date}
        onChange={(_, dateString) => onChange?.(dateString)}
        {...rest}
      />
    </PreviewFieldBase>
  )
}

/**
 * 获取单个选项
 * 用于解决 antd Select onChange option类型定义可能为数组的问题
 * @example
 * onChange={(_, option) => {
    form.setValue('name', getSingleOption(option)?.label)
  }}
 */
export function getSingleOption<T>(option: T): T extends Array<unknown> ? T[0] : T {
  return Array.isArray(option) ? option[0] : (option as T extends Array<unknown> ? T[0] : T)
}

type SelectRef = React.ComponentRef<typeof Select>

interface PreviewFieldSelectProps {
  value: any
  onChange?: (value: any) => void
  code: string
}

function PreviewFieldSelect({ value, onChange, code }: PreviewFieldSelectProps) {
  const selectRef = useRef<SelectRef>(null)
  const getEnumsQuery = useContext(DocumentEditorEnumsContext)
  const getEnumsQueryRef = useRef(getEnumsQuery || (() => undefined))
  const enumsList = getEnumsQueryRef.current({ element_code: code })

  const labelName = useMemo(() => `$${code}_select_label]`, [code])

  const labelValue = Form.useWatch(labelName)

  const options = useMemo(
    () =>
      enumsList?.map((item) => ({ label: item.name, value: item.code })) || [
        {
          label: labelValue,
          value: value,
        },
      ],
    [enumsList]
  )

  const label = useMemo(() => options.find((item) => item.value === value)?.label, [value, options])

  const handleSetSize = useCallback((size: number) => {
    if (selectRef.current) {
      selectRef.current.nativeElement.querySelector<HTMLInputElement>(
        '.ant-select-content'
      )!.style.width = `${size}px`
    }
  }, [])

  const form = Form.useFormInstance()

  return (
    <PreviewFieldBase value={label} onSetSize={handleSetSize}>
      <Select
        popupMatchSelectWidth={false}
        showSearch={{ filterOption: true }}
        options={options}
        value={value}
        onChange={(value, option) => {
          onChange?.(value)
          form.setFieldsValue({ [labelName]: getSingleOption(option)?.label })
        }}
        className="input-wrapper"
        classNames={{
          input: 'input',
        }}
        ref={selectRef}
      />
      <Form.Item noStyle name={labelName} />
    </PreviewFieldBase>
  )
}

interface VariableCheckboxProps {
  value?: boolean
  onChange?: (value: boolean) => void
}
function VariableCheckbox({ value, onChange }: VariableCheckboxProps) {
  const inputable = useAtomValue(inputableAtom)

  return (
    <span
      className="variable-node-checkbox"
      onClick={() => {
        inputable && onChange?.(!value)
      }}
    >
      {value ? <GrCheckboxSelected /> : <GrCheckbox />}
    </span>
  )
}

export interface PreviewFieldProps {
  value?: any
  onChange?: (value: any) => void
  type: VariableType
  code: string
}

export default function PreviewField({ value, onChange, code, type }: PreviewFieldProps) {
  const inputable = useAtomValue(inputableAtom)

  if (!inputable) return <Text value={value} />

  switch (type) {
    case 'number':
    case 'text':
      return <PreviewFieldInput value={value} onChange={onChange} />

    case 'select':
      return <PreviewFieldSelect value={value} onChange={onChange} code={code} />

    case 'date':
    case 'time':
    case 'date-time':
      return <PreviewFieldDatePicker value={value} onChange={onChange} type={type} />

    case 'boolean':
      return <VariableCheckbox value={value} onChange={onChange} />

    default:
      return <Text value={value} />
  }
}
