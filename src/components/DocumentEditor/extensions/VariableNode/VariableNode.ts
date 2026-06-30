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
  required?: boolean
  minLen?: number
  maxLen?: number
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
      required: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-node-required') !== 'false',
      },
      minLen: {
        default: 0,
        parseHTML: (element) => {
          const v = element.getAttribute('data-node-min-len')
          return v ? Number.parseInt(v) : undefined
        },
      },
      maxLen: {
        default: 0,
        parseHTML: (element) => {
          const v = element.getAttribute('data-node-max-len')
          return v ? Number.parseInt(v) : undefined
        },
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
        'data-node-required': attrs.required,
        'data-node-min-len': attrs.minLen,
        'data-node-max-len': attrs.maxLen,
        class: 'variable-node',
      },
    ]
  },

  renderText({ node }) {
    const attrs = node.attrs as VariableNodeAttrs

    const searchParams = new URLSearchParams()
    searchParams.set('variable', attrs.code)
    searchParams.set('type', attrs.type)
    searchParams.set('showLabel', attrs.showLabel ? 'true' : 'false')
    searchParams.set('labelAlias', attrs.labelAlias || '')
    searchParams.set('required', attrs.required ? 'true' : 'false')
    if (attrs.minLen) searchParams.set('minLen', attrs.minLen.toString())
    if (attrs.maxLen) searchParams.set('maxLen', attrs.maxLen.toString())

    return `{{${attrs.label}:${attrs.code}?${searchParams.toString()}}}`
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /\{\{([^:]+):([^?]+)\?([^}]*)\}\}/g,
        type: this.type,
        getAttributes: (match) => {
          const [, label, code, search] = match

          const searchParams = new URLSearchParams(search)
          const type = searchParams.get('type') || 'text'
          const showLabel = searchParams.get('showLabel') === 'true'
          const labelAlias = searchParams.get('labelAlias') || ''
          const required = searchParams.get('required') === 'true'
          const minLenStr = searchParams.get('minLen')
          const minLen = minLenStr ? Number.parseInt(minLenStr) : undefined
          const maxLenStr = searchParams.get('maxLen')
          const maxLen = maxLenStr ? Number.parseInt(maxLenStr) : undefined

          return {
            label,
            code,
            type,
            showLabel,
            labelAlias,
            required,
            minLen,
            maxLen,
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
