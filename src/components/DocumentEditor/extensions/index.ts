export { PageBreakNode as PageBreak } from './PageBreakNode'
export { TextIndentNode as TextIndent } from './TextIndentNode'
export { VariableNode as Variable } from './VariableNode'
export type { VariableViewMode, VariableViewState } from './VariableViewExtension'
export { VariableViewExtension as VariableView } from './VariableViewExtension'

import type { Extensions } from '@tiptap/core'
import { PageBreakNode } from './PageBreakNode'
import { TextIndentNode } from './TextIndentNode'
import { VariableNode } from './VariableNode'
import { VariableViewExtension } from './VariableViewExtension'

/**
 * 编辑器和预览器共享的自定义扩展
 * 新增自定义块只需在此数组中添加即可，Editor 和 Previewer 都会自动加载
 */
export const sharedExtensions: Extensions = [
  TextIndentNode,
  PageBreakNode,
  VariableNode,
  VariableViewExtension,
]
