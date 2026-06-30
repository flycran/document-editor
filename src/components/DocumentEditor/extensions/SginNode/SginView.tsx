import { NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { MdFingerprint } from 'react-icons/md'
import { SginNodeAttrs } from './SginNode'
import { SGIN_ENUMS } from './SginUtils'
import './SginView.scss'
import { useAtomValue } from 'jotai'
import { useDocumentSgin } from '../../contexts/DocumentEditorEventContext'
import { editableAtom } from '../../DocumentEditorStore'

export default function SginView({ node, editor, getPos }: ReactNodeViewProps) {
  const attrs = node.attrs as SginNodeAttrs

  const editable = useAtomValue(editableAtom)

  const sginContext = useDocumentSgin()

  const handleClick = () => {
    switch (attrs.type) {
      case 'doctor':
        sginContext.onDoctorSgin?.()
        break
      case 'patient':
        sginContext.onPatientSgin?.()
        break
      case 'family':
        sginContext.onFamilySgin?.()
        break
    }
  }

  const sginImage = useMemo(() => {
    switch (attrs.type) {
      case 'doctor':
        return sginContext.doctorSginImage
      case 'patient':
        return sginContext.patientSginImage
      case 'family':
        return sginContext.familySginImage
    }
  }, [attrs.type, sginContext])

  return (
    <NodeViewWrapper as="span" className={clsx('sgin-node', editable ? 'editor' : 'preview')}>
      <span className="sgin-node-curly-braces">{'{{'}</span>
      <span
        className="sgin-node-content"
        onClick={() => editor.commands.setNodeSelection(getPos()!)}
      >
        {(attrs.showLabel || editable) && (
          <span
            className={clsx('sgin-node-label', {
              delete: !attrs.showLabel,
            })}
          >
            {attrs.labelAlias || SGIN_ENUMS[attrs.type]}
          </span>
        )}
        <span className="sgin-node-separator">:&nbsp;</span>
        <span className="sgin-node-code" onClick={handleClick}>
          {editable || !sginImage ? (
            <span className="sgin-icon">
              <MdFingerprint />
            </span>
          ) : (
            <img className="sgin-node-image" src={sginImage} />
          )}
        </span>
      </span>
      <span className="sgin-node-curly-braces">{'}}'}</span>
    </NodeViewWrapper>
  )
}
