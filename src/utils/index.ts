import SginViewStyleInline from '../components/DocumentEditor/extensions/SginNode/SginView.scss?inline'
import VariableViewStyleInline from '../components/DocumentEditor/extensions/VariableNode/VariableView.scss?inline'
import styleInline from '../components/DocumentEditor/styles.scss?inline'
import PreviewFieldInline from '../components/PreviewField/PreviewField.scss?inline'

const getPreviewIframe = (element: HTMLElement) => {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  iframe.style.position = 'fixed'
  iframe.style.display = 'none'
  iframe.style.left = '-99999px'
  iframe.style.top = '0'
  const iframeWindow = iframe.contentWindow
  const addStyle = (styleUrl: string) => {
    const style = document.createElement('style')
    style.innerHTML = styleUrl
    iframeWindow?.document.head.appendChild(style)
  }
  addStyle(styleInline)
  addStyle(VariableViewStyleInline)
  addStyle(SginViewStyleInline)
  addStyle(PreviewFieldInline)

  const cloneElement = element.cloneNode(true) as HTMLElement

  iframeWindow?.document.body.appendChild(cloneElement)
  return iframe
}

export const documentPrint = async (element: HTMLElement) => {
  const iframe = getPreviewIframe(element)!
  if (iframe.contentDocument) {
    await Promise.all(
      [...iframe.contentDocument.images].map((img) => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }

          const done = () => resolve()
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
        })
      })
    )
  }
  await new Promise(requestAnimationFrame)
  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()
  iframe.remove()
}

export const getPreviewHTML = (element: HTMLElement) => {
  const iframe = getPreviewIframe(element)
  const html = iframe.contentWindow!.document.documentElement.outerHTML
  iframe.remove()
  return html
}
