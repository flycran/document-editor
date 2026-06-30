import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { VariableNodeAttrs } from './VariableNode'
import './VariableView.scss'
import { Form } from 'antd'
import { Rule } from 'antd/es/form'
import { useAtomValue } from 'jotai'
import PreviewField from '@/components/PreviewField/PreviewField'
import { editableAtom } from '../../DocumentEditorStore'

export default function VariableView({ node, editor, getPos }: ReactNodeViewProps) {
  const attrs = node.attrs as VariableNodeAttrs

  const editable = useAtomValue(editableAtom)
  const form = Form.useFormInstance()

  const rules = useMemo(() => {
    const rules: Rule[] = []
    if (attrs.required) rules.push({ required: true, message: '该选项必填' })
    return rules
  }, [attrs.required])

  return (
    <NodeViewWrapper as="span" className={clsx('variable-node', editable ? 'editor' : 'preview')}>
      <span className="variable-node-curly-braces">{'{{'}</span>
      <span
        className="variable-node-content"
        onClick={() => editable && editor.commands.setNodeSelection(getPos()!)}
      >
        {attrs.type === 'boolean' && (
          <Form.Item noStyle name={attrs.code}>
            <PreviewField code={attrs.code} type={attrs.type} />
          </Form.Item>
        )}
        <Form.Item
          required={attrs.required}
          key={attrs.code}
          name={attrs.code}
          colon={attrs.type !== 'boolean' && (attrs.showLabel || editable)}
          className="variable-node-item"
          rules={rules}
          label={
            (attrs.showLabel || editable) && (
              <span
                onClick={
                  !editable && attrs.type === 'boolean'
                    ? () => {
                        form.setFieldValue(attrs.code, !form.getFieldValue(attrs.code))
                      }
                    : undefined
                }
                className={clsx('variable-node-label', {
                  delete: !attrs.showLabel,
                })}
              >
                {attrs.labelAlias || attrs.label}
              </span>
            )
          }
        >
          {attrs.type !== 'boolean' &&
            (editable ? attrs.code : <PreviewField code={attrs.code} type={attrs.type} />)}
        </Form.Item>
      </span>
      <span className="variable-node-curly-braces">{'}}'}</span>
    </NodeViewWrapper>
  )
}
