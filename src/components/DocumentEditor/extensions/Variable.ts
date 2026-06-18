import { Node } from '@tiptap/core'

export const VariableNode = Node.create({
  name: 'variable',
  group: 'inline',
  atom: true,
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
})
