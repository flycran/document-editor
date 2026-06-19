import { Node } from '@tiptap/core'

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
        parseHTML: (element) => element.querySelector('.variable-node-label')?.textContent || '',
      },
      code: {
        default: '',
        parseHTML: (element) => element.querySelector('.variable-node-code')?.textContent || '',
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
    const display = label || key

    return [
      'span',
      {
        'data-variable-key': key,
        class: 'variable-node',
        contenteditable: 'false',
      },
      ['span', { class: 'variable-node-label' }, display],
      ['span', { class: 'variable-node-separator' }, ':'],
      ['span', { class: 'variable-node-code' }, code],
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
})
