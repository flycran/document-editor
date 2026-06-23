import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { GrCheckbox, GrCheckboxSelected } from 'react-icons/gr'
import { usePreviewMode } from '../../contexts/PreviewModeContext'
import { VariableNodeAttrs } from './VariableNode'
import './VariableView.scss'
import { Form } from 'antd'
import AutoWidthInput from '@/components/AutoWidthInput/AutoWidthInput'

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
          <span className={'variable-node-code'}>
            {isPreview ? (
              <Form.Item key={attrs.code} name={attrs.code} noStyle>
                <AutoWidthInput />
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
