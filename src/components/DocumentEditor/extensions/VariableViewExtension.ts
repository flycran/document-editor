import { Extension } from '@tiptap/core'

/**
 * VariableView 打开模式
 * - insert: 点击变量插入新节点（默认）
 * - replace: 点击变量替换当前选中的变量节点
 */
export type VariableViewMode = 'insert' | 'replace'

export interface VariableViewState {
  open: boolean
  mode: VariableViewMode
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    variableView: {
      /** 切换变量抽屉的打开/关闭状态，可传入 mode 参数 */
      toggleVariableView: (mode?: VariableViewMode) => ReturnType
      /** 打开变量抽屉 */
      openVariableView: (mode?: VariableViewMode) => ReturnType
      /** 关闭变量抽屉 */
      closeVariableView: () => ReturnType
    }
  }

  interface Storage {
    variableView: VariableViewState
  }
}

/**
 * 变量抽屉扩展 — 通过命令控制变量抽屉的打开/关闭和模式
 * 不包含 UI，仅管理状态和命令
 */
export const VariableViewExtension = Extension.create({
  name: 'variableView',

  addStorage() {
    return {
      open: false,
      mode: 'insert',
    } as VariableViewState
  },

  addCommands() {
    return {
      toggleVariableView: (mode?: VariableViewMode) => () => {
        const storage = this.storage
        if (storage.open) {
          storage.open = false
        } else {
          storage.open = true
          storage.mode = mode || 'insert'
        }
        return true
      },
      openVariableView: (mode?: VariableViewMode) => () => {
        this.storage.open = true
        this.storage.mode = mode || 'insert'
        return true
      },
      closeVariableView:
        () =>
        ({ editor }) => {
          const storage = editor.storage.variableView
          storage.open = false
          return true
        },
    }
  },
})
