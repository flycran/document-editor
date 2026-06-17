import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType
    }
  }
}

export const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  parseHTML() {
    return [{ tag: 'div.page-break' }]
  },

  renderHTML() {
    return [
      'div',
      {
        class: 'page-break',
        contenteditable: 'false',
        style:
          'height: 2px; background: repeating-linear-gradient(90deg, #999 0px, #999 6px, transparent 6px, transparent 12px); margin: 24px 0; position: relative;',
      },
      [
        'span',
        {
          style:
            'position: absolute; left: 50%; top: -10px; transform: translateX(-50%); background: #fff; padding: 0 8px; color: #999; font-size: 12px;',
        },
        '—— 分页符 ——',
      ],
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
