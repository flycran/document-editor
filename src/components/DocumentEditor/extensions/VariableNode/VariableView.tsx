import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { GrCheckbox, GrCheckboxSelected } from 'react-icons/gr'
import { usePreviewMode } from '../../contexts/PreviewModeContext'
import { VariableNodeAttrs } from './VariableNode'
import './VariableView.scss'
import { Form } from 'antd'

export interface AutoWidthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string
}

function AutoWidthInput({
  type = 'text',
  className,
  inputClassName,
  defaultValue,
  value,
  onChange,
  ...rest
}: AutoWidthInputProps) {
  const currentValue = value ?? defaultValue

  const inputRef = useRef<HTMLInputElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (inputRef.current && measureRef.current) {
      inputRef.current.style.width = `${measureRef.current.offsetWidth}px`
    }
  }, [currentValue])

  // measure 用于测算宽度，统一转字符串避免渲染 dayjs 等对象崩溃
  const displayValue =
    currentValue == null
      ? ''
      : typeof currentValue === 'string'
        ? currentValue
        : String(currentValue)

  return (
    <span className="auto-width-input">
      <span ref={measureRef} className="measure">
        {displayValue}
      </span>
      <input
        {...rest}
        ref={inputRef}
        className="input"
        defaultValue={defaultValue}
        value={displayValue}
        onChange={onChange}
        type={type}
      />
    </span>
  )
}

interface TextProps {
  value?: unknown
}

function Text({ value }: TextProps) {
  if (value == null || value === '') return null
  // 防御：表单值可能是 dayjs 等非字符串对象，统一转字符串，避免 React 渲染对象崩溃
  return typeof value === 'string' ? value : String(value)
}

interface VariableCheckboxProps {
  value?: boolean
  onChange?: (value: boolean) => void
}
function VariableCheckbox({ value, onChange }: VariableCheckboxProps) {
  return (
    <span
      className="variable-node-checkbox"
      onClick={() => {
        onChange?.(!value)
      }}
    >
      {value ? <GrCheckboxSelected /> : <GrCheckbox />}
    </span>
  )
}

export default function VariableView({ node, editor, getPos }: ReactNodeViewProps) {
  const attrs = node.attrs as VariableNodeAttrs

  const { isPreview } = usePreviewMode()
  const form = Form.useFormInstance()

  return (
    <NodeViewWrapper as="span" className={clsx('variable-node', isPreview ? 'preview' : 'editor')}>
      <span className="variable-node-curly-braces">{'{{'}</span>
      <span
        className="variable-node-content"
        onClick={() => editor.commands.setNodeSelection(getPos()!)}
      >
        {attrs.type === 'boolean' && (
          <Form.Item noStyle name={attrs.code}>
            <VariableCheckbox />
          </Form.Item>
        )}
        {(attrs.showLabel || !isPreview) && (
          <span
            onClick={
              isPreview && attrs.type === 'boolean'
                ? () => {
                    form.setFieldValue(attrs.code, !form.getFieldValue(attrs.code))
                  }
                : undefined
            }
            className={clsx('variable-node-label', {
              ['delete']: !attrs.showLabel,
            })}
          >
            {attrs.labelAlias || attrs.label}
          </span>
        )}
        {attrs.type !== 'boolean' && (attrs.showLabel || !isPreview) && (
          <span className={'variable-node-separator'}>:&nbsp;</span>
        )}
        {attrs.type !== 'boolean' && (
          <span className="variable-node-code">
            {isPreview ? (
              <Form.Item key={attrs.code} name={attrs.code} noStyle>
                {attrs.type === 'text' ? <AutoWidthInput /> : <Text />}
              </Form.Item>
            ) : (
              attrs.code
            )}
          </span>
        )}
      </span>
      <span className="variable-node-curly-braces">{'}}'}</span>
    </NodeViewWrapper>
  )
}
