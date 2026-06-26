import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router'
import {
  useGetQuestcenterInformedTemplateGetMedicalTemplateList,
  useGetQuestcenterInformedTemplateGetTemplateDetailByMedicalId,
} from '@/api/codegen/petstore'
import doctorSginImage from '@/assets/sgin.png'
import DocumentEditor, { EditorRef } from '@/components/DocumentEditor/DocumentEditor'
import { useRHM } from '@/hooks/useRHM'
import { OutletContext } from '@/types/router'
export default function EditorPage() {
  const { content, setContent } = useOutletContext<OutletContext>()
  const { key } = useRHM()
  const editorRef = useRef<EditorRef | null>(null)
  const [template, setTemplate] = useState<string>()

  // 防抖保存：编辑时不去每次都算 JSON，停顿 500ms 后才算一次写入 content。
  // content 只用于预览页，不再回灌编辑器（useEditor 的 deps=[]，content 变化不会重置编辑器）。
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const handleUpdate = () => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const editor = editorRef.current?.editor
      if (editor && !editor.isDestroyed) {
        setContent(editor.getJSON())
      }
    }, 500)
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
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
          onUpdate={handleUpdate}
          doctorSginImage={doctorSginImage}
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
