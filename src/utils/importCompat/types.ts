/**
 * importCompat 模块类型定义
 */

/** 旧格式输入 */
export interface OldFormatInput {
  rich_text: string
  rich_config: string
}

/** rich_config 中 paragraph_map 下单个元素的配置 */
export interface ElementConfig {
  id: string
  code: string
  name: string
  value_type: string
  alias_name?: string
  ui?: {
    data_name?: {
      alias_name?: string
      show?: boolean
    }
    data_value?: {
      show?: boolean
    }
  }
  [key: string]: unknown
}

/** Tiptap 节点（宽松类型，覆盖 doc/paragraph/text/variable 等） */
export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: TiptapMark[]
  text?: string
}

/** Tiptap mark */
export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

/** DOM 遍历上下文 */
export interface WalkContext {
  /** compose_code → ElementConfig */
  configMap: Map<string, ElementConfig>
  /** 从祖先元素继承的 marks */
  inheritedMarks: TiptapMark[]
}

/** 元素处理器：接收元素和上下文，返回 Tiptap 节点数组 */
export type ElementHandler = (
  el: HTMLElement,
  ctx: WalkContext,
  walkChildren: (el: HTMLElement, ctx: WalkContext) => TiptapNode[]
) => TiptapNode[]
