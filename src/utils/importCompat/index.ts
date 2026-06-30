import { parseRichConfig } from './config-resolver'
import { htmlToTiptap } from './dom-to-tiptap'
import type { OldFormatInput } from './types'

/**
 * 检测输入是否为旧格式
 */
export function isOldFormat(input: unknown): input is OldFormatInput {
  if (!input || typeof input !== 'object') return false
  const obj = input as Record<string, unknown>
  return typeof obj.rich_text === 'string' && typeof obj.rich_config === 'string'
}

/**
 * 将旧格式转换为 Tiptap content JSON
 * @param input - { rich_text: string, rich_config: string }
 * @returns Tiptap doc JSON
 */
export function convertOldFormat(input: OldFormatInput): Record<string, unknown> {
  const configMap = parseRichConfig(input.rich_config)
  return htmlToTiptap(input.rich_text, configMap) as unknown as Record<string, unknown>
}

export type { OldFormatInput } from './types'
