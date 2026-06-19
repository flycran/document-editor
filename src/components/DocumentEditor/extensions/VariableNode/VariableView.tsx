import { css } from '@emotion/css'
import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { useDocumentVariable } from '../../contexts/DocumentVariableContext'
import { VariableNodeAttrs } from './VariableNode'

const style = {
  editor: css`
    display: inline-block;
    padding: 0 2px;
    margin: 0 2px;
    color: #1677ff;
    cursor: default;
    height: 1.375em;
    line-height: 1.375em;

    &.ProseMirror-selectednode {
      outline: 2px solid #1677ff60;
      border-radius: 3px;
    }

    ::before {
      content: "{{";
      font-weight: 500;
      margin-right: 0.25em;
    }

    ::after {
      content: "}}";
      font-weight: 500;
      margin-left: 0.25em;
    }

    .variable-node-label {
      color: rgb(228, 120, 44);
    }
    .variable-node-separator {
      margin: 0 0.25em;
    }
    .variable-node-code {
      color: rgb(0, 143, 145);
    }
  `,
  preview: css`

  `,
}

export default function VariableView({ node, editor }: ReactNodeViewProps) {
  const attrs = node.attrs as VariableNodeAttrs

  const variable = useDocumentVariable()

  if (editor.isEditable) {
    return (
      <NodeViewWrapper as="span" className={clsx('variable-node', style.editor)}>
        <span className="variable-node-label">{attrs.label}</span>
        <span className="variable-node-separator">:</span>
        <span className="variable-node-code">{attrs.code}</span>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper as="span" className={clsx('variable-node', style.preview)}>
      <span className="variable-node-label">{attrs.label}</span>
      <span className="variable-node-separator">:</span>
      <span className="variable-node-code">{variable[attrs.code]}</span>
    </NodeViewWrapper>
  )
}
