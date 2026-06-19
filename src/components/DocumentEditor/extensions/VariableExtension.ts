import { Extension } from '@tiptap/core'

/**
 * 抽屉打开模式
 * - insert: 点击变量插入新节点（默认）
 * - replace: 点击变量替换当前选中的变量节点
 */
export type VariableExtensionMode = 'insert' | 'replace'

export interface VariableExtensionState {
  open: boolean
  mode: VariableExtensionMode
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variableExtension: {
      /** 切换变量抽屉的打开/关闭状态，可传入 mode 参数 */
      toggleVariableDrawer: (mode?: VariableExtensionMode) => ReturnType
      /** 打开变量抽屉 */
      openVariableDrawer: (mode?: VariableExtensionMode) => ReturnType
      /** 关闭变量抽屉 */
      closeVariableDrawer: () => ReturnType
    }
  }

  interface Storage {
    variableExtension: VariableExtensionState
  }

  interface EditorEvents {
    'variableExtension:change': VariableExtensionState
  }
}

/**
 * 变量抽屉扩展 — 通过命令控制变量抽屉的打开/关闭和模式
 * 不包含 UI，仅管理状态和命令
 */
export const VariableExtension = Extension.create({
  name: 'variableExtension',

  addStorage() {
    return {
      open: false,
      mode: 'insert',
    } as VariableExtensionState
  },

  addCommands() {
    return {
      toggleVariableDrawer: (mode?: VariableExtensionMode) => () => {
        if (this.storage.open) {
          this.storage.open = false
        } else {
          this.storage.open = true
          this.storage.mode = mode || 'insert'
        }
        this.editor.emit('variableExtension:change', {
          open: this.storage.open,
          mode: this.storage.mode,
        })
        return true
      },
      openVariableDrawer: (mode?: VariableExtensionMode) => () => {
        this.storage.open = true
        this.storage.mode = mode || 'insert'
        this.editor.emit('variableExtension:change', {
          open: this.storage.open,
          mode: this.storage.mode,
        })
        return true
      },
      closeVariableDrawer:
        () =>
        ({ editor }) => {
          const storage = editor.storage.variableExtension
          storage.open = false
          this.editor.emit('variableExtension:change', {
            open: this.storage.open,
            mode: this.storage.mode,
          })
          return true
        },
    }
  },
})
