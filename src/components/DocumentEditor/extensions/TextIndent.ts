import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textIndent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
  }
}

/**
 * 缩进
 */
export const TextIndentNode = Extension.create({
  name: 'textIndent',

  addCommands() {
    return {
      indent:
        () =>
        ({ state, commands }) => {
          const { $from } = state.selection
          const current = ($from.node().attrs.indent as number) || 0
          return commands.updateAttributes('paragraph', {
            indent: current + 1,
          })
        },
      outdent:
        () =>
        ({ state, commands }) => {
          const { $from } = state.selection
          const current = ($from.node().attrs.indent as number) || 0
          if (current <= 0) return false
          return commands.updateAttributes('paragraph', {
            indent: current - 1,
          })
        },
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const indent = element.style.textIndent
              if (!indent) return 0
              return Math.round(Number.parseFloat(indent) / 32)
            },
            renderHTML: (attributes) => {
              const level = (attributes.indent as number) || 0
              if (level === 0) return {}
              return {
                style: `text-indent: ${level * 32}px`,
              }
            },
          },
        },
      },
    ]
  },
})
