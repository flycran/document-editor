import { Attribute, Node, nodePasteRule } from '@tiptap/core'
import { NodeSelection } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import VariableView from './VariableView'

export type VariableType = 'boolean' | 'text' | 'number' | 'date' | 'time' | 'date-time' | 'select'

export interface VariableNodeAttrs {
  label: string
  code: string
  type: VariableType
  showLabel?: boolean
  labelAlias?: string
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variable: {
      insertVariable: (attrs: VariableNodeAttrs) => ReturnType
      updateVariable: (attrs: Partial<VariableNodeAttrs>) => ReturnType
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
        default: '',
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

  renderText({ node }) {
    const attrs = node.attrs as VariableNodeAttrs

    return `{{${attrs.label}:${attrs.code}?type=${attrs.type}&showLabel=${attrs.showLabel}&labelAlias=${attrs.labelAlias}}}`
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /\{\{([^:]+):([^?]+)\?type=([^&]*)&showLabel=([^&]*)&labelAlias=([^}]*)\}\}/g,
        type: this.type,
        getAttributes: (match) => {
          const [, label, code, type, showLabel, labelAlias] = match

          console.log(label)

          return {
            label,
            code,
            type,
            showLabel: showLabel === 'true',
            labelAlias,
          }
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-l': () =>
        this.editor.commands.updateVariable({
          showLabel: this.editor.isActive(this.name, { showLabel: false }),
        }),
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
      updateVariable:
        (attrs) =>
        ({ editor }) => {
          const { state, view } = editor
          const selection = state.selection

          if (selection instanceof NodeSelection) {
            const pos = selection.from

            const newAttrs = {
              ...selection.node.attrs,
              attrs,
            }

            const tr = state.tr

            tr.setNodeMarkup(pos, undefined, newAttrs)

            // 强制恢复 NodeSelection
            tr.setSelection(NodeSelection.create(tr.doc, pos))

            view.dispatch(tr)
            return true
          }
          return false
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableView)
  },
})
