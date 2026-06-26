import SginViewStyleInline from '../components/DocumentEditor/extensions/SginNode/SginView.scss?inline'
import VariableViewStyleInline from '../components/DocumentEditor/extensions/VariableNode/VariableView.scss?inline'
import styleInline from '../components/DocumentEditor/styles.scss?inline'
import PreviewFieldInline from '../components/PreviewField/PreviewField.scss?inline'

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
  addStyle(styleInline)
  addStyle(VariableViewStyleInline)
  addStyle(SginViewStyleInline)
  addStyle(PreviewFieldInline)

  iframeWindow?.document.body.appendChild(element.cloneNode(true))
  return iframe
}

export const getPreviewHTML = (element: HTMLElement) => {
  const iframe = getPreviewIframe(element)
  const html = iframe.contentWindow!.document.documentElement.innerHTML
  iframe.remove()
  return html
}
