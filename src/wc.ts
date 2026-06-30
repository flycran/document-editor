import { Ref } from 'react'
import { PreviewerProps, PreviewerRef } from './components/DocumentPreviewer/DocumentPreviewer'
import {
  DocumentPreviewerElement,
  HTMLPreviewerElement,
} from './components/DocumentPreviewer/DocumentPreviewerWebComponent'

export type * from './components/DocumentEditor/contexts/DocumentEditorEnumsContext'
export type * from './components/DocumentEditor/contexts/DocumentEditorEventContext'
export type * from './components/DocumentEditor/extensions/VariableExtension'
export type * from './components/DocumentEditor/extensions/VariableNode/VariableNode'
export * from './components/DocumentPreviewer/DocumentPreviewer'
export type { HTMLPreviewerElement } from './components/DocumentPreviewer/DocumentPreviewerWebComponent'
export * from './hooks/useGetPublicEnumsQueryHook'

export interface PreviewerElement
  extends Partial<Omit<React.HTMLAttributes<HTMLElement>, 'className' | 'content'>>,
    Omit<PreviewerProps, 'ref'>,
    Partial<PreviewerRef> {
  ref?: Ref<HTMLPreviewerElement>
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'document-previewer': PreviewerElement
    }
  }
}

/**
 * 注册 <document-previewer> 自定义元素。
 */
function defineDocumentPreviewer() {
  if (!customElements.get('document-previewer')) {
    customElements.define('document-previewer', DocumentPreviewerElement)
  }
}

defineDocumentPreviewer()
