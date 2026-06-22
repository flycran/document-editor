import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { MdFingerprint } from 'react-icons/md'
import { usePreviewMode } from '../../contexts/PreviewModeContext'
import { SginNodeAttrs } from './SginNode'
import { sginEnum } from './SginUtils'
import './SginView.scss'

export default function SginView({ node, editor, getPos }: ReactNodeViewProps) {
  const attrs = node.attrs as SginNodeAttrs

  const { isPreview } = usePreviewMode()

  return (
    <NodeViewWrapper as="span" className={clsx('sgin-node', isPreview ? 'preview' : 'editor')}>
      <span className="sgin-node-curly-braces">{'{{'}</span>
      <span
        className="sgin-node-content"
        onClick={() => editor.commands.setNodeSelection(getPos()!)}
      >
        <span className="sgin-node-label">{sginEnum[attrs.type]}</span>
        <span className="sgin-node-separator">:&nbsp;</span>
        <span className="sgin-node-code">
          <MdFingerprint />
        </span>
      </span>
      <span className="sgin-node-curly-braces">{'}}'}</span>
    </NodeViewWrapper>
  )
}
