import { getAllNodes } from './all-nodes'
import { OldFormatInput } from './types'
import Worker from './worker?worker'

export function convertOldResponseFormatInWorker(input: OldFormatInput): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker()

    worker.onmessage = (e: MessageEvent<string>) => {
      resolve(e.data)
      worker.terminate()
    }

    worker.onerror = (e) => {
      reject(e)
      worker.terminate()
    }

    worker.postMessage({
      type: 'response',
      data: input,
    })
  })
}

export function convertOldHTMLFormatInWorker(input: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const worker = new Worker()

    worker.onmessage = (e: MessageEvent<string>) => {
      resolve(e.data)
      worker.terminate()
    }

    worker.onerror = (e) => {
      reject(e)
      worker.terminate()
    }

    worker.postMessage({
      type: 'html',
      data: input,
      nodes: await getAllNodes(),
    })
  })
}
