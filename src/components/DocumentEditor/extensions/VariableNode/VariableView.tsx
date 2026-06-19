import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { useDocumentVariable } from '../../contexts/DocumentVariableContext'
import { usePreviewMode } from '../../contexts/PreviewModeContext'
import { VariableNodeAttrs } from './VariableNode'
import styles from './VariableView.module.scss'

export default function VariableView({ node }: ReactNodeViewProps) {
  const attrs = node.attrs as VariableNodeAttrs

  const { variables } = useDocumentVariable()
  const { isPreview } = usePreviewMode()

  if (!isPreview) {
    return (
      <NodeViewWrapper
        as="span"
        className={clsx('variable-node', styles['variable'], styles.editor)}
      >
        <>
          <span className={styles['variable-node-label']}>{attrs.label}</span>
          <span className={styles['variable-node-separator']}>:</span>
          <span className={styles['variable-node-code']}>{attrs.code}</span>
        </>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className={clsx('variable-node', styles['variable'], styles.preview)}
    >
      <span className={styles['variable-node-label']}>{attrs.label}</span>
      <span className={styles['variable-node-separator']}>:</span>
      <span className={styles['variable-node-code']}>{variables[attrs.code]}</span>
    </NodeViewWrapper>
  )
}
