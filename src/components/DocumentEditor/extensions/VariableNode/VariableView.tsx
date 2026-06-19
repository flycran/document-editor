import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { GrCheckbox, GrCheckboxSelected } from 'react-icons/gr'
import { useDocumentVariable } from '../../contexts/DocumentVariableContext'
import { usePreviewMode } from '../../contexts/PreviewModeContext'
import { VariableNodeAttrs } from './VariableNode'
import styles from './VariableView.module.scss'

export default function VariableView({ node }: ReactNodeViewProps) {
  const attrs = node.attrs as VariableNodeAttrs

  const { variables } = useDocumentVariable()
  const { isPreview } = usePreviewMode()

  return (
    <NodeViewWrapper
      as="span"
      className={clsx(
        'variable-node',
        styles['variable'],
        isPreview ? styles.preview : styles.editor
      )}
    >
      <>
        {attrs.type === 'boolean' && (
          <span className={styles['variable-node-checkbox']}>
            {variables[attrs.code] ? <GrCheckboxSelected /> : <GrCheckbox />}
          </span>
        )}
        <span className={styles['variable-node-label']}>{attrs.label}</span>
        {attrs.type !== 'boolean' && (
          <>
            <span className={styles['variable-node-separator']}>:</span>
            <span className={styles['variable-node-code']}>
              {isPreview ? variables[attrs.code] : attrs.code}
            </span>
          </>
        )}
      </>
    </NodeViewWrapper>
  )
}
