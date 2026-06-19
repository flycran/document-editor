import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { MdFingerprint } from 'react-icons/md'
import { usePreviewMode } from '../../contexts/PreviewModeContext'
import { SginNodeAttrs } from './SginNode'
import { sginEnum } from './SginUtils'
import styles from './SginView.module.scss'

export default function SginView({ node }: ReactNodeViewProps) {
  const attrs = node.attrs as SginNodeAttrs

  const { isPreview } = usePreviewMode()

  if (!isPreview) {
    return (
      <NodeViewWrapper
        as="span"
        className={clsx('variable-node', styles['sgin-view'], styles['editor'])}
      >
        <span className={styles['variable-node-label']}>{sginEnum[attrs.type]}</span>
        <span className={styles['variable-node-separator']}>:</span>
        <span className={styles['variable-node-code']}>
          <MdFingerprint />
        </span>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      as="span"
      className={clsx('variable-node', styles['sgin-view'], styles.preview)}
    >
      <span className={styles['variable-node-label']}>{sginEnum[attrs.type]}</span>
      <span className={styles['variable-node-separator']}>:</span>
      <span className={styles['variable-node-code']}>
        <MdFingerprint />
      </span>
    </NodeViewWrapper>
  )
}
