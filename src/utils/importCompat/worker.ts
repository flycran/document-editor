import { InformedTemplateNodeListItemElementsItem } from '@/api/codegen/schemas'
import { convertOldHTMLFormat, convertOldResponseFormat } from '.'
import { OldFormatInput } from './types'

self.onmessage = (
  e: MessageEvent<
    | {
        type: 'response'
        data: OldFormatInput
      }
    | {
        type: 'html'
        data: string
        nodes: Map<string, InformedTemplateNodeListItemElementsItem>
      }
  >
) => {
  if (e.data.type === 'response') {
    const result = convertOldResponseFormat(e.data.data)
    self.postMessage(result)
  } else if (e.data.type === 'html') {
    const result = convertOldHTMLFormat(e.data.data, e.data.nodes)
    self.postMessage(result)
  }
}
