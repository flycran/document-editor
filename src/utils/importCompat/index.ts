import { InformedTemplateNodeListItemElementsItem } from '@/api/codegen/schemas'
import { parseRichConfig } from './config-resolver'
import { htmlToTiptapHtml } from './html-to-tiptap-html'
import type { OldFormatInput } from './types'

/**
 * 将旧格式转换为 Tiptap HTML 字符串
 *
 * @param input - { rich_text: string, rich_config: string }
 * @returns Tiptap 可解析的 HTML 字符串
 */
export function convertOldResponseFormat(input: OldFormatInput): string {
  const configMap = parseRichConfig(input.rich_config)
  return htmlToTiptapHtml(input.rich_text, configMap)
}

/**
 * 将旧格式转换为 Tiptap HTML 字符串
 *
 * @param input - string
 * @returns Tiptap 可解析的 HTML 字符串
 */
export function convertOldHTMLFormat(
  input: string,
  nodes: Map<string, InformedTemplateNodeListItemElementsItem>
): string {
  return htmlToTiptapHtml(input, nodes)
}
