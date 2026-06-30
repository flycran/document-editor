import { getConfig } from './config-resolver'
import type { ElementHandler, TiptapMark, WalkContext } from './types'
import { createVariableNode } from './variable-mapper'

/**
 * 从 HTML 元素的 style 属性中提取 textStyle mark
 */
function extractTextStyleMark(el: HTMLElement): TiptapMark | null {
  const style = el.getAttribute('style') || ''
  const attrs: Record<string, unknown> = {}

  // 提取 font-size
  const fontSizeMatch = style.match(/font-size\s*:\s*([^;]+)/i)
  if (fontSizeMatch) {
    attrs.fontSize = fontSizeMatch[1].trim()
  }

  // 提取 color
  const colorMatch = style.match(/(?:^|[^-])color\s*:\s*([^;]+)/i)
  if (colorMatch) {
    attrs.color = colorMatch[1].trim()
  }

  if (Object.keys(attrs).length > 0) {
    return { type: 'textStyle', attrs }
  }
  return null
}

/**
 * 从 HTML 元素的 style 中提取 textAlign
 */
function extractTextAlign(el: HTMLElement): string | null {
  const style = el.getAttribute('style') || ''
  const match = style.match(/text-align\s*:\s*([^;]+)/i)
  return match ? match[1].trim() : null
}

/**
 * 判断是否为块级元素（需要生成 paragraph）
 */
function isBlockElement(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase()
  return (
    tag === 'div' ||
    tag === 'p' ||
    tag === 'h1' ||
    tag === 'h2' ||
    tag === 'h3' ||
    tag === 'h4' ||
    tag === 'h5' ||
    tag === 'h6'
  )
}

// ─── 各元素处理器 ────────────────────────────────────

/**
 * div 处理器：创建 paragraph 节点，提取 textAlign，递归处理子节点
 */
const handleDiv: ElementHandler = (el, ctx, walkChildren) => {
  const textAlign = extractTextAlign(el)
  const children = walkChildren(el, ctx)

  // 空 div 或只有 br → 空 paragraph
  if (children.length === 0) {
    return [{ type: 'paragraph', attrs: { textAlign: textAlign || null, indent: 0 } }]
  }

  return [
    { type: 'paragraph', attrs: { textAlign: textAlign || null, indent: 0 }, content: children },
  ]
}

/**
 * span 处理器：提取 textStyle mark，追加到继承 marks，递归处理子节点
 */
const handleSpan: ElementHandler = (el, ctx, walkChildren) => {
  const mark = extractTextStyleMark(el)
  const newCtx: WalkContext = mark ? { ...ctx, inheritedMarks: [...ctx.inheritedMarks, mark] } : ctx
  return walkChildren(el, newCtx)
}

/**
 * strong 处理器：追加 bold mark
 */
const handleStrong: ElementHandler = (el, ctx, walkChildren) => {
  const newCtx: WalkContext = {
    ...ctx,
    inheritedMarks: [...ctx.inheritedMarks, { type: 'bold' }],
  }
  return walkChildren(el, newCtx)
}

/**
 * em 处理器：追加 italic mark
 */
const handleEm: ElementHandler = (el, ctx, walkChildren) => {
  const newCtx: WalkContext = {
    ...ctx,
    inheritedMarks: [...ctx.inheritedMarks, { type: 'italic' }],
  }
  return walkChildren(el, newCtx)
}

/**
 * u 处理器：追加 underline mark
 */
const handleU: ElementHandler = (el, ctx, walkChildren) => {
  const newCtx: WalkContext = {
    ...ctx,
    inheritedMarks: [...ctx.inheritedMarks, { type: 'underline' }],
  }
  return walkChildren(el, newCtx)
}

/**
 * data-element 处理器：从 compose_code 查找配置，生成 variable 节点
 */
const handleDataElement: ElementHandler = (el, ctx, _walkChildren) => {
  const composeCode = el.getAttribute('data-compose_code') || ''
  const config = getConfig(ctx.configMap, composeCode)
  if (config) {
    return [createVariableNode(config)]
  }
  // 找不到配置时，返回空
  return []
}

/**
 * br 处理器：生成 hardBreak
 */
const handleBr: ElementHandler = (_el, _ctx, _walkChildren) => {
  return [{ type: 'hardBreak' }]
}

// ─── 处理器分发 ──────────────────────────────────────

/** 标签名 → 处理器 */
const HANDLERS: Record<string, ElementHandler> = {
  div: handleDiv,
  span: handleSpan,
  strong: handleStrong,
  em: handleEm,
  u: handleU,
  'data-element': handleDataElement,
  br: handleBr,
}

/**
 * 根据标签名获取对应的处理器
 */
export function getHandler(tagName: string): ElementHandler | undefined {
  return HANDLERS[tagName.toLowerCase()]
}

/**
 * 注册自定义处理器（扩展点）
 */
export function registerHandler(tagName: string, handler: ElementHandler): void {
  HANDLERS[tagName.toLowerCase()] = handler
}

export { extractTextAlign, isBlockElement }
