import r2wc from '@r2wc/react-to-web-component'
import locale from 'antd/locale/zh_CN'
import { Ref, useEffect, useRef } from 'react'
import DocumentPreviewer, { type PreviewerProps, type PreviewerRef } from './DocumentPreviewer'
import 'dayjs/locale/zh-cn'
import { ConfigProvider } from 'antd'
import themeConfig from '@/config/theme'
import { useGetPublicEnumsQueryHook } from '@/hooks/useGetPublicEnumsQueryHook'
import { DocumentEditorEnumsProvider } from '../DocumentEditor/contexts/DocumentEditorEnumsContext'

dayjs.locale('zh-cn')

export interface HTMLPreviewerElement
  extends Partial<Omit<HTMLElement, 'className'>>,
    Omit<PreviewerProps, 'ref' | 'getEnumsQuery'>,
    Partial<PreviewerRef> {
  ref?: Ref<HTMLPreviewerElement>
}

interface WrapperProps extends PreviewerProps {
  container?: HTMLElement
}

function PreviewerWrapper({ container, ...rest }: WrapperProps) {
  const previewRef = useRef<PreviewerRef>(null)
  const el = container as HTMLPreviewerElement | undefined
  const contentRef = useRef(el?.content)
  const formDataRef = useRef(el?.formData)

  useEffect(() => {
    if (!container) return
    const el = container as HTMLPreviewerElement
    // 用 getter 代理完整 ref API 到自定义元素实例
    const defs: PropertyDescriptorMap = {
      editor: { get: () => previewRef.current?.editor, configurable: true },
      form: { get: () => previewRef.current?.form, configurable: true },
      print: { get: () => previewRef.current?.print, configurable: true },
      getPreviewHTML: { get: () => previewRef.current?.getPreviewHTML, configurable: true },
    }
    Object.defineProperties(el, defs)
    return () => {
      // 卸载时清理，避免引用失效的 ref
      delete el.editor
      delete el.form
      delete el.print
      delete el.getPreviewHTML
    }
  }, [container])

  return (
    <ConfigProvider locale={locale} theme={themeConfig}>
      <DocumentEditorEnumsProvider>
        <DocumentPreviewer
          {...rest}
          getEnumsQuery={useGetPublicEnumsQueryHook}
          content={contentRef.current}
          formData={formDataRef.current}
          ref={previewRef}
        />
      </DocumentEditorEnumsProvider>
    </ConfigProvider>
  )
}

const DocumentPreviewerElement = r2wc(PreviewerWrapper, {
  props: {
    content: 'json',
    formData: 'json',
    inputable: 'boolean',
    className: 'string',
  },
})

export { DocumentPreviewerElement }
