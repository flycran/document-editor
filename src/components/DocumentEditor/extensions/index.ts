import type { Extensions } from '@tiptap/core'
import { PageBreakBanner } from './PageBreakBanner'
import { PageBreakNode } from './PageBreakNode'
import { SginNode } from './SginNode/SginNode'
import { TableExtension } from './TableExtension'
import { TextIndentNode } from './TextIndentNode'
import { VariableExtension } from './VariableExtension'
import { VariableNode } from './VariableNode/VariableNode'

/**
 * 编辑器和预览器共享的自定义扩展
 * 新增自定义块只需在此数组中添加即可，Editor 和 Previewer 都会自动加载
 */
export const sharedExtensions: Extensions = [
  TextIndentNode,
  PageBreakNode,
  VariableNode,
  SginNode,
  VariableExtension,
  TableExtension,
  PageBreakBanner,
]
