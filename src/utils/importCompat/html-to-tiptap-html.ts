import { parseHTML } from 'linkedom'
import { getConfig } from './config-resolver'
import type { ElementConfig } from './types'
import { createVariableNode } from './variable-mapper'

function replaceTag(el: Element, tagName: string, doc: Document) {
  const newEl = doc.createElement(tagName, {})

  // 复制属性
  for (const attr of el.attributes) {
    newEl.setAttribute(attr.name, attr.value)
  }

  // 移动子节点
  newEl.append(...el.childNodes)

  el.replaceWith(newEl)

  return newEl
}

/**
 * 将旧格式 HTML 中的 <data-element> 替换为 Tiptap 能识别的 HTML
 * - variable → <span class="variable-node" data-node-*="...">
 * - sgin → <span class="sgin-node" data-node-*="..." contenteditable="false">
 *
 * 其余 HTML 内容原样保留，不做任何转换。
 */
export function htmlToTiptapHtml(html: string, configMap: Map<string, ElementConfig>): string {
  const { document: doc } = parseHTML(`<html><body>${html}</body></html>`, 'text/html')

  // 替换所有div为p标签
  const divElements = doc.querySelectorAll('div')

  for (const el of divElements) {
    replaceTag(el, 'p', doc)
  }

  // 遍历所有 <data-element> 标签并替换
  const dataElements = doc.querySelectorAll('data-element')
  for (const el of dataElements) {
    const composeCode = el.getAttribute('data-compose_code') || ''
    const config = getConfig(configMap, composeCode)

    if (config) {
      const node = createVariableNode(config, el.querySelector('data-name')?.textContent)
      const span = buildTiptapSpan(doc, node)
      el.replaceWith(span)
    } else {
      // 找不到配置，移除该节点
      el.remove()
    }
  }

  return doc.body.innerHTML
}

/**
 * 根据 node 结果创建对应的 <span> 元素
 * 生成的 HTML 格式与 VariableNode.renderHTML / SginNode.renderHTML 保持一致
 */
function buildTiptapSpan(
  doc: Document,
  node: { type: string; attrs: Record<string, unknown> }
): HTMLSpanElement {
  const span = doc.createElement('span', {})
  const { attrs } = node

  if (node.type === 'sgin') {
    span.className = 'sgin-node'
    span.setAttribute('data-node-type', String(attrs.type || ''))
    span.setAttribute('data-node-show-label', String(attrs.showLabel !== false))
    span.setAttribute('data-node-label-alias', String(attrs.labelAlias || ''))
    span.setAttribute('contenteditable', 'false')
  } else {
    span.className = 'variable-node'
    span.setAttribute('data-node-label', String(attrs.label || ''))
    span.setAttribute('data-node-code', String(attrs.code || ''))
    span.setAttribute('data-node-type', String(attrs.type || 'text'))
    span.setAttribute('data-node-show-label', String(attrs.showLabel !== false))
    span.setAttribute('data-node-label-alias', String(attrs.labelAlias || ''))
    span.setAttribute('data-node-required', String(attrs.required !== false))
    span.setAttribute('data-node-min-len', String(attrs.minLen || 0))
    span.setAttribute('data-node-max-len', String(attrs.maxLen || 0))
  }

  return span
}
