import { Node } from '@tiptap/core'
import tiptapStyles from '../styles.module.scss'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType
    }
  }
}

/**
 * 分页符
 */
export const PageBreakNode = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      key: {
        default: '',
      },

      label: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [{ tag: `div.${tiptapStyles['page-break']}` }]
  },

  renderHTML() {
    return [
      'div',
      {
        class: tiptapStyles['page-break'],
        contenteditable: 'false',
      },
      ['span', {}, '分页符'],
    ]
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name })
        },
    }
  },
})
