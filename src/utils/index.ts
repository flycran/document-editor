import SginViewStyleUrl from '../components/DocumentEditor/extensions/SginNode/SginView.scss?inline'
import VariableViewStyleUrl from '../components/DocumentEditor/extensions/VariableNode/VariableView.scss?inline'
import styleUrl from '../components/DocumentEditor/styles.scss?inline'

export const documentPrint = (element: HTMLElement) => {
  const iframe = getPreviewIframe(element)
  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()
  iframe.remove()
}

const getPreviewIframe = (element: HTMLElement) => {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  iframe.style.display = 'none'
  const iframeWindow = iframe.contentWindow
  const addStyle = (styleUrl: string) => {
    const style = document.createElement('style')
    style.innerHTML = styleUrl
    iframeWindow?.document.head.appendChild(style)
  }
  addStyle(styleUrl)
  addStyle(VariableViewStyleUrl)
  addStyle(SginViewStyleUrl)

  iframeWindow?.document.body.appendChild(element.cloneNode(true))
  return iframe
}

export const getPreviewHTML = (element: HTMLElement) => {
  const iframe = getPreviewIframe(element)
  return iframe.contentWindow!.document.documentElement.innerHTML
}
