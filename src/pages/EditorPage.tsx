import { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import {
  useGetQuestcenterInformedTemplateGetMedicalTemplateList,
  useGetQuestcenterInformedTemplateGetTemplateDetailByMedicalId,
} from '@/api/codegen/petstore'
import DocumentEditor from '@/components/DocumentEditor'
import { useRHM } from '@/hooks/useRHM'

interface OutletContext {
  content: string
  setContent: (content: string) => void
}

export default function EditorPage() {
  const { content, setContent } = useOutletContext<OutletContext>()
  const { key } = useRHM()
  const editorRef = useRef<Editor | null>(null)
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
          variableListProps={{
            templateList: templateListData?.data?.list,
            templateValue: template,
            variableList: templateData?.data?.paragraph_list,
            onTemplateSelect: setTemplate,
          }}
        />
      </div>
    </div>
  )
}
