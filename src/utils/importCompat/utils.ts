import { JSONContent } from '@tiptap/react'
import { OldFormatInput } from './types'
import { convertOldHTMLFormatInWorker, convertOldResponseFormatInWorker } from './use-worker'

/**
 * 检测输入是否为旧格式
 */
export function isOldResponseFormat(input: unknown): input is OldFormatInput {
  if (!input || typeof input !== 'object') return false
  const obj = input as Record<string, unknown>
  return typeof obj.rich_text === 'string' && typeof obj.rich_config === 'string'
}

export function isOldHTMLFormat(input: unknown): input is string {
  return typeof input === 'string' && input.includes('</data-element>')
}

export async function convertContent(input: string) {
  const getContent = () => {
    try {
      return JSON.parse(input)
    } catch (e) {
      return input
    }
  }
  const content = getContent()
  if (isOldResponseFormat(content)) {
    return await convertOldResponseFormatInWorker(content)
  }
  if (isOldHTMLFormat(content)) {
    return await convertOldHTMLFormatInWorker(content)
  }
  return content as JSONContent | string
}
