import { Attribute, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { SginType as SginType } from './SginUtils'
import SginView from './SginView'
import styles from './SginView.module.scss'

export interface SginNodeAttrs {
  type: SginType
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
  selectable: true,

  addAttributes(): Record<keyof SginNodeAttrs, Attribute> {
    return {
      type: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-node-type') || '',
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
    const { type } = node.attrs as SginNodeAttrs

    return [
      'span',
      {
        'data-node-type': type,
        class: 'sgin-node',
        contenteditable: 'false',
      },
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
    return ReactNodeViewRenderer(SginView, {
      className: styles.wrapper,
    })
  },
})
