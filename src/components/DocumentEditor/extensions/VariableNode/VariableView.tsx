import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { GrCheckbox, GrCheckboxSelected } from 'react-icons/gr'
import { useDocumentVariable } from '../../contexts/DocumentVariableContext'
import { usePreviewMode } from '../../contexts/PreviewModeContext'
import { VariableNodeAttrs } from './VariableNode'
import './VariableView.scss'

export default function VariableView({ node, editor, getPos }: ReactNodeViewProps) {
  const attrs = node.attrs as VariableNodeAttrs

  const { variables } = useDocumentVariable()
  const { isPreview } = usePreviewMode()

  return (
    <NodeViewWrapper as="span" className={clsx('variable-node', isPreview ? 'preview' : 'editor')}>
      <span className="variable-node-curly-braces">{'{{'}</span>
      <span
        className="variable-node-content"
        onClick={() => editor.commands.setNodeSelection(getPos()!)}
      >
        {attrs.type === 'boolean' && (
          <span className={'variable-node-checkbox'}>
            {variables[attrs.code] ? <GrCheckboxSelected /> : <GrCheckbox />}
          </span>
        )}
        {(attrs.showLabel || !isPreview) && (
          <span
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
            {isPreview ? variables[attrs.code] : attrs.code}
          </span>
        )}
      </span>
      <span className="variable-node-curly-braces">{'}}'}</span>
    </NodeViewWrapper>
  )
}
