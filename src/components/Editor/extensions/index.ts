export { PageBreak } from './PageBreak'
export { TextIndent } from './TextIndent'
export { Variable } from './Variable'

import type { Extensions } from '@tiptap/core'
import { PageBreak } from './PageBreak'
import { TextIndent } from './TextIndent'
import { Variable } from './Variable'

/**
 * 编辑器和预览器共享的自定义扩展
 * 新增自定义块只需在此数组中添加即可，Editor 和 Previewer 都会自动加载
 */
export const sharedExtensions: Extensions = [TextIndent, PageBreak, Variable]
