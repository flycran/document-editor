import { getHandler } from './element-handlers'
import type { ElementConfig, TiptapMark, TiptapNode, WalkContext } from './types'

/**
 * 合并相邻的 text 节点（marks 相同时合并 text 内容）
 */
function mergeTextNodes(nodes: TiptapNode[]): TiptapNode[] {
  const result: TiptapNode[] = []
  for (const node of nodes) {
    if (node.type === 'text' && result.length > 0) {
      const last = result[result.length - 1]
      if (last.type === 'text' && marksEqual(last.marks, node.marks)) {
        last.text = (last.text || '') + (node.text || '')
        continue
      }
    }
    result.push(node)
  }
  return result
}

/**
 * 比较两个 marks 数组是否相等
 */
function marksEqual(a?: TiptapMark[], b?: TiptapMark[]): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (a.length !== b.length) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * 递归遍历 DOM 子树，输出 Tiptap 节点数组
 */
function walkNode(node: Node, ctx: WalkContext): TiptapNode[] {
  // 文本节点
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    // 跳过纯空白文本（但保留空格）
    if (!text) return []
    return [
      {
        type: 'text',
        text,
        marks: ctx.inheritedMarks.length > 0 ? [...ctx.inheritedMarks] : undefined,
      },
    ]
  }

  // 非元素节点跳过
  if (node.nodeType !== Node.ELEMENT_NODE) return []

  const el = node as HTMLElement
  const tagName = el.tagName.toLowerCase()
  const handler = getHandler(tagName)

  // walkChildren 闭包：遍历当前元素的子节点
  const walkChildren = (parent: HTMLElement, childCtx: WalkContext): TiptapNode[] => {
    const result: TiptapNode[] = []
    for (let i = 0; i < parent.childNodes.length; i++) {
      result.push(...walkNode(parent.childNodes[i], childCtx))
    }
    return mergeTextNodes(result)
  }

  if (handler) {
    return handler(el, ctx, walkChildren)
  }

  // 未知元素：直接递归处理子节点
  return walkChildren(el, ctx)
}

/**
 * 将 HTML 字符串转换为 Tiptap doc JSON
 * @param html - HTML 字符串
 * @param configMap - compose_code → ElementConfig 的 Map
 * @returns Tiptap doc 节点
 */
export function htmlToTiptap(html: string, configMap: Map<string, ElementConfig>): TiptapNode {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body

  const ctx: WalkContext = {
    configMap,
    inheritedMarks: [],
  }

  const content: TiptapNode[] = []

  for (let i = 0; i < body.childNodes.length; i++) {
    const child = body.childNodes[i]
    const nodes = walkNode(child, ctx)

    // 将顶层节点按块级/行内分组到 paragraph 中
    for (const node of nodes) {
      if (node.type === 'paragraph') {
        // 已是 paragraph，直接添加
        content.push(node)
      } else {
        // 行内节点（text、variable 等），包装到 paragraph 中
        // 尝试追加到最后一个 paragraph
        const last = content[content.length - 1]
        if (last && last.type === 'paragraph' && last.content) {
          last.content.push(node)
        } else {
          content.push({
            type: 'paragraph',
            attrs: { textAlign: null, indent: 0 },
            content: [node],
          })
        }
      }
    }
  }

  // 合并相邻 text 节点
  for (const para of content) {
    if (para.type === 'paragraph' && para.content) {
      para.content = mergeTextNodes(para.content)
    }
  }

  return { type: 'doc', content }
}
