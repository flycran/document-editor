import type { Editor } from '@tiptap/react'
import { Input, Modal } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { VariableNodeAttrs } from '../extensions/VariableNode/VariableNode'

interface AliasModalProps {
  open: boolean
  editor: Editor
  onClose: () => void
}

export default function AliasModal({ open, editor, onClose }: AliasModalProps) {
  const { currentAlias, currentLabel } = useMemo(() => {
    if (!open) return { currentAlias: '', currentLabel: '' }
    const { from, to } = editor.state.selection
    const aliases: string[] = []
    const labels: string[] = []
    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === 'variable') {
        aliases.push(node.attrs.labelAlias ?? '')
        labels.push(node.attrs.label ?? '')
      }
    })
    const allSameAlias = aliases.length > 0 && aliases.every((a) => a === aliases[0])
    const allSameLabel = labels.length > 0 && labels.every((l) => l === labels[0])
    return {
      currentAlias: allSameAlias ? aliases[0] : '',
      currentLabel: allSameLabel ? labels[0] : '',
    }
  }, [open, editor])

  const [value, setValue] = useState(currentAlias)

  useEffect(() => {
    if (open) {
      setValue(currentAlias)
    }
  }, [open, currentAlias])

  return (
    <Modal
      width={360}
      title="设置别名"
      open={open}
      onOk={() => {
        editor
          .chain()
          .focus()
          .updateAttributes('variable', { labelAlias: value || null } as VariableNodeAttrs)
          .run()
        onClose()
      }}
      onCancel={() => onClose()}
      destroyOnHidden
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={currentLabel || '请输入别名'}
        allowClear
      />
    </Modal>
  )
}
