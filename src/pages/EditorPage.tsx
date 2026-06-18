import { useOutletContext } from 'react-router'
import {
  useGetQuestcenterInformedTemplateGetMedicalTemplateList,
  useGetQuestcenterInformedTemplateGetTemplateDetailByMedicalId,
} from '@/api/codegen/petstore'
import DocumentEditor from '@/components/DocumentEditor'
import VariableView from '@/components/VariableView/VariableView'
import { useRHM } from '@/hooks/useRHM'

interface OutletContext {
  content: string
  setContent: (content: string) => void
}

export default function EditorPage() {
  const { content, setContent } = useOutletContext<OutletContext>()
  const { key } = useRHM()
  const [open, setOpen] = useState(false)
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-800 m-0">文书编辑</h1>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <DocumentEditor
          key={key}
          placeholder="请输入文书内容..."
          content={content}
          onUpdate={setContent}
          variableViewOpen={open}
          onSetVariableViewOpen={setOpen}
        />
        <VariableView
          open={open}
          onClose={() => setOpen(false)}
          templateList={templateListData?.data?.list}
          templateValue={template}
          onTemplateSelect={setTemplate}
          variableList={templateData?.data?.paragraph_list}
        />
      </div>
    </div>
  )
}
