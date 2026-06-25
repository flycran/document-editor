import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { MdFingerprint } from 'react-icons/md'
import { SginNodeAttrs } from './SginNode'
import { sginEnum } from './SginUtils'
import './SginView.scss'
import { useAtomValue } from 'jotai'
import { editableAtom } from '../../DocumentEditorStore'

export default function SginView({ node, editor, getPos }: ReactNodeViewProps) {
  const attrs = node.attrs as SginNodeAttrs

  const editable = useAtomValue(editableAtom)

  return (
    <NodeViewWrapper as="span" className={clsx('sgin-node', editable ? 'editor' : 'preview')}>
      <span className="sgin-node-curly-braces">{'{{'}</span>
      <span
        className="sgin-node-content"
        onClick={() => editor.commands.setNodeSelection(getPos()!)}
      >
        {attrs.showLabel && (
          <span
            className={clsx('sgin-node-label', {
              delete: !attrs.showLabel,
            })}
          >
            {attrs.labelAlias || sginEnum[attrs.type]}
          </span>
        )}
        <span className="sgin-node-separator">:&nbsp;</span>
        <span className="sgin-node-code">
          <MdFingerprint />
        </span>
      </span>
      <span className="sgin-node-curly-braces">{'}}'}</span>
    </NodeViewWrapper>
  )
}
