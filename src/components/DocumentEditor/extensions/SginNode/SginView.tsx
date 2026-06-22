import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { MdFingerprint } from 'react-icons/md'
import { usePreviewMode } from '../../contexts/PreviewModeContext'
import { SginNodeAttrs } from './SginNode'
import { sginEnum } from './SginUtils'
import styles from './SginView.module.scss'

export default function SginView({ node }: ReactNodeViewProps) {
  const attrs = node.attrs as SginNodeAttrs

  const { isPreview } = usePreviewMode()

  return (
    <NodeViewWrapper
      as="span"
      className={clsx('sgin-node', styles['sgin-view'], isPreview ? styles.preview : styles.editor)}
    >
      <span className={styles['sgin-node-label']}>{sginEnum[attrs.type]}</span>
      <span className={styles['sgin-node-separator']}>:&nbsp;</span>
      <span className={styles['sgin-node-code']}>
        <MdFingerprint />
      </span>
    </NodeViewWrapper>
  )
}
