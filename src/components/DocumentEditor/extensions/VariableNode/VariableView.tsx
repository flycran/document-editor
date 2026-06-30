import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { VariableNodeAttrs } from './VariableNode'
import './VariableView.scss'
import { Form } from 'antd'
import { useAtomValue } from 'jotai'
import PreviewField from '@/components/PreviewField/PreviewField'
import { editableAtom } from '../../DocumentEditorStore'

export default function VariableView({ node, editor, getPos }: ReactNodeViewProps) {
  const attrs = node.attrs as VariableNodeAttrs

  const editable = useAtomValue(editableAtom)
  const form = Form.useFormInstance()

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
        {(attrs.showLabel || editable) && (
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
        )}
        {attrs.type !== 'boolean' && (attrs.showLabel || editable) && (
          <span className={'variable-node-separator'}>:&nbsp;</span>
        )}
        {attrs.type !== 'boolean' && (
          <span className="variable-node-code">
            {editable ? (
              attrs.code
            ) : (
              <Form.Item key={attrs.code} name={attrs.code} noStyle>
                {<PreviewField code={attrs.code} type={attrs.type} />}
              </Form.Item>
            )}
          </span>
        )}
      </span>
      <span className="variable-node-curly-braces">{'}}'}</span>
    </NodeViewWrapper>
  )
}
