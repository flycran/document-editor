import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import 'document-editor/wc'
import 'document-editor/wc/document-editor.css'
import { QueryClient } from '@tanstack/react-query'
import { Button, Divider, Space } from 'antd'
import { type HTMLPreviewerElement, type PreviewerElement } from 'document-editor/wc'

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'document-previewer': PreviewerElement
    }
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000,
      gcTime: 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
})

const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      attrs: { textAlign: null, indent: 0 },
      content: [
        { type: 'text', text: '这是编辑器' },
        { type: 'hardBreak' },
        {
          type: 'variable',
          attrs: {
            label: '病案号',
            code: 'DE01.00.004.00',
            type: 'text',
            showLabel: true,
            labelAlias: '',
          },
        },
        { type: 'hardBreak' },
        {
          type: 'variable',
          attrs: {
            label: '简要病史-胚胎停育/胎死宫内',
            code: 'YW05.00.00.20',
            type: 'boolean',
            showLabel: true,
            labelAlias: '',
          },
        },
        { type: 'hardBreak' },
        {
          type: 'variable',
          attrs: {
            label: '出生日期',
            code: 'DE02.01.005.01',
            type: 'date',
            showLabel: true,
            labelAlias: '',
          },
        },
        { type: 'hardBreak' },
        {
          type: 'variable',
          attrs: {
            label: '性别代码',
            code: 'DE02.01.040.00',
            type: 'select',
            showLabel: true,
            labelAlias: '',
          },
        },
      ],
    },
  ],
}

function App() {
  const ref = useRef<HTMLPreviewerElement>(null)

  useEffect(() => {
    ref.current!.content = initialContent
  }, [])

  return (
    <div>
      <document-previewer ref={ref} inputable />
      <Divider />
      <Space>
        <Button onClick={() => console.log(ref.current?.getPreviewHTML?.())}>
          输出HTML到控制台
        </Button>
        <Button onClick={() => console.log(ref.current?.form?.getFieldsValue())}>
          输出表单到控制台
        </Button>
        <Button onClick={() => ref.current?.print?.()}>打印</Button>
      </Space>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
