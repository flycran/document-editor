import { JSONContent } from '@tiptap/react'
import { App } from 'antd'
import { useEffect, useRef, useState } from 'react'
import {
  useGetQuestcenterInformedTemplateGetMedicalTemplateList,
  useGetQuestcenterInformedTemplateGetTemplateDetailByMedicalId,
} from '@/api/codegen/petstore'
import doctorSginImage from '@/assets/sgin.png'
import DocumentEditor, { EditorRef } from '@/components/DocumentEditor/DocumentEditor'
import { useGetPublicEnumsQueryHook } from '@/hooks/useGetPublicEnumsQueryHook'
import { useRHM } from '@/hooks/useRHM'

interface EditorPageProps {
  content?: JSONContent
  setContent: (content: JSONContent) => void
}

export default function EditorPage({ content, setContent }: EditorPageProps) {
  const { key } = useRHM()
  const editorRef = useRef<EditorRef | null>(null)
  const [template, setTemplate] = useState<string>()
  const { message } = App.useApp()

  useEffect(() => {
    return () => {
      console.log(editorRef.current)
    }
  }, [])

  const { data: templateListData, isFetching: templateListDataIsFetching } =
    useGetQuestcenterInformedTemplateGetMedicalTemplateList()

  const { data: templateData, isFetching: templateDataIsFetching } =
    useGetQuestcenterInformedTemplateGetTemplateDetailByMedicalId(
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
      <div className="flex-1 shrink-0 h-0 bg-white">
        <DocumentEditor
          key={key}
          ref={editorRef}
          placeholder="请输入文书内容..."
          content={content}
          className="h-full"
          inputable
          doctorSginImage={doctorSginImage}
          getEnumsQuery={useGetPublicEnumsQueryHook}
          onSave={({ editor }) => {
            setContent(editor.getJSON())
            message.success('已保存到本地，可切换到预览页面查看')
          }}
          variableListProps={{
            templateList: templateListData?.data?.list,
            templateListLoading: templateListDataIsFetching,
            templateValue: template,
            variableList: templateData?.data?.paragraph_list,
            variableListLoading: templateDataIsFetching,
            onTemplateSelect: setTemplate,
          }}
        />
      </div>
    </div>
  )
}
