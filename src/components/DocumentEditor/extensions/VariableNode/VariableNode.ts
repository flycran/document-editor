import { Attribute, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import VariableView from './VariableView'

export type VariableType = 'boolean' | 'text' | 'number' | 'date' | 'time' | 'date-time'

export interface VariableNodeAttrs {
  label: string
  code: string
  type: VariableType
  showLabel?: boolean
  labelAlias?: string | null
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      insertVariable: (attrs: VariableNodeAttrs) => ReturnType
    }
  }
}

/**
 * 变量节点 — 在文档中插入一个不可编辑的变量标签
 */
export const VariableNode = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes(): Record<keyof VariableNodeAttrs, Attribute> {
    return {
      label: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-node-label')!,
      },
      code: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-node-code')!,
      },
      type: {
        default: 'text',
        parseHTML: (element) => element.getAttribute('data-node-type') || 'text',
      },
      showLabel: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-node-show-label') !== 'false',
      },
      labelAlias: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-node-label-alias'),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span.variable-node',
      },
    ]
  },

  renderHTML({ node }) {
    const attrs = node.attrs as VariableNodeAttrs

    return [
      'span',
      {
        'data-node-label': attrs.label,
        'data-node-code': attrs.code,
        'data-node-type': attrs.type,
        'data-node-show-label': attrs.showLabel,
        'data-node-label-alias': attrs.labelAlias,
        class: 'variable-node',
      },
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-l': () =>
        this.editor
          .chain()
          .focus()
          .updateAttributes(this.name, {
            showLabel: this.editor.isActive(this.name, { showLabel: false }),
          })
          .run(),
    }
  },

  addCommands() {
    return {
      insertVariable:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableView)
  },
})
