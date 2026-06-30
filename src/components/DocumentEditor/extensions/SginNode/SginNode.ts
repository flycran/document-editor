import { Attribute, Node, nodePasteRule } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { SGIN_ENUMS, SginType as SginType } from './SginUtils'
import SginView from './SginView'

export interface SginNodeAttrs {
  type: SginType
  showLabel?: boolean
  labelAlias?: string
}
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fingerprint: {
      insertFingerprint: (attrs: SginNodeAttrs) => ReturnType
    }
  }
}

/**
 * 指纹节点
 */
export const SginNode = Node.create({
  name: 'sgin',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes(): Record<keyof SginNodeAttrs, Attribute> {
    return {
      type: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-node-type') || '',
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
        tag: 'span.sgin-node',
      },
    ]
  },

  renderHTML({ node }) {
    const attrs = node.attrs as SginNodeAttrs

    return [
      'span',
      {
        'data-node-type': attrs.type,
        'data-node-show-label': attrs.showLabel,
        'data-node-label-alias': attrs.labelAlias,
        class: 'sgin-node',
        contenteditable: 'false',
      },
    ]
  },

  renderText({ node }) {
    const attrs = node.attrs as SginNodeAttrs

    return `{{${SGIN_ENUMS[attrs.type]}?showLabel=${attrs.showLabel}&labelAlias=${attrs.labelAlias}}}`
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /\{\{([^:]+)\?showLabel=([^&]*)&labelAlias=([^}]*)\}\}/g,
        type: this.type,
        getAttributes: (match) => {
          const [, label, showLabel, labelAlias] = match

          return {
            label,
            showLabel: showLabel === 'true',
            labelAlias,
          }
        },
      }),
    ]
  },

  addCommands() {
    return {
      insertFingerprint:
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
    return ReactNodeViewRenderer(SginView)
  },
})
