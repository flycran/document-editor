import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import VariableView from './VariableView'

export interface VariableNodeAttrs {
  key: string
  label: string
  code: string
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
  selectable: true,

  addAttributes() {
    return {
      key: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-variable-key') || '',
      },
      label: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-node-label') || '',
      },
      code: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-node-code') || '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable-key]',
      },
    ]
  },

  renderHTML({ node }) {
    const { key, label, code } = node.attrs as VariableNodeAttrs

    return [
      'span',
      {
        'data-variable-key': key,
        'data-node-label': label,
        'data-node-code': code,
        class: 'variable-node',
        contenteditable: 'false',
      },
    ]
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
