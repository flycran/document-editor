import { Editor } from '@tiptap/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import {
  useGetQuestcenterInformedTemplateGetMedicalTemplateList,
  useGetQuestcenterInformedTemplateGetTemplateDetailByMedicalId,
} from '@/api/codegen/petstore'
import DocumentEditor from '@/components/DocumentEditor'
import type { VariableViewMode } from '@/components/DocumentEditor/extensions/VariableViewExtension'
import VariableView from '@/components/VariableView/VariableView'
import { useRHM } from '@/hooks/useRHM'

interface OutletContext {
  content: string
  setContent: (content: string) => void
}

export default function EditorPage() {
  const { content, setContent } = useOutletContext<OutletContext>()
  const { key } = useRHM()
  const editorRef = useRef<Editor | null>(null)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<VariableViewMode>('insert')
  const [template, setTemplate] = useState<string>()

  const { data: templateListData } = useGetQuestcenterInformedTemplateGetMedicalTemplateList()

  const { data: templateData } = useGetQuestcenterInformedTemplateGetTemplateDetailByMedicalId(
    {
      medical_id: template!,
    },
    {
      query: {
        enabled: !!template,
      },
    }
  )

  useEffect(() => {
    if (templateListData?.data?.list.length && !template) {
      setTemplate(templateListData?.data?.list[0].medical_id)
    }
  }, [templateListData?.data?.list])

  // 监听 editor storage 中的 variableView 状态变化
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const checkStorage = () => {
      const storage = editor.storage.variableView
      if (storage) {
        setOpen(storage.open)
        setMode(storage.mode)
      }
    }

    // 通过监听 transaction 来检测 storage 变化
    editor.on('transaction', checkStorage)
    // 初始检查
    checkStorage()

    return () => {
      editor.off('transaction', checkStorage)
    }
  }, [])

  const handleClose = useCallback(() => {
    editorRef.current?.commands.closeVariableView()
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-800 m-0">文书编辑</h1>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <DocumentEditor
          key={key}
          ref={editorRef}
          placeholder="请输入文书内容..."
          content={content}
          onUpdate={setContent}
        >
          <VariableView
            open={open}
            mode={mode}
            onClose={handleClose}
            templateList={templateListData?.data?.list}
            templateValue={template}
            onTemplateSelect={setTemplate}
            variableList={templateData?.data?.paragraph_list}
          />
        </DocumentEditor>
      </div>
    </div>
  )
}
