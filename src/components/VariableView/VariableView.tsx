import { css } from '@emotion/css'
import { Drawer, DrawerProps, Select, Tree } from 'antd'
import {
  GetQuestcenterInformedTemplateGetMedicalTemplateList200ListItem,
  GetQuestcenterInformedTemplateGetTemplateDetailByMedicalId200ParagraphListItem,
} from '@/api/codegen/schemas'

const style = css`
`

export interface VariableViewProps extends DrawerProps {
  variableList?: GetQuestcenterInformedTemplateGetTemplateDetailByMedicalId200ParagraphListItem[]
  templateList?: GetQuestcenterInformedTemplateGetMedicalTemplateList200ListItem[]
  templateValue?: string
  onTemplateSelect?: (templateMedicalId: string) => void
}

export default function VariableView({
  variableList,
  templateList,
  templateValue,
  onTemplateSelect,
  className,
  ...rest
}: VariableViewProps) {
  const [$template, $setTemplate1] = useState<string>()

  useEffect(() => {
    if (templateValue) {
      $setTemplate1(templateValue)
    }
  }, [templateValue])

  useEffect(() => {
    if (onTemplateSelect && $template) {
      onTemplateSelect($template)
    }
  }, [$template])

  const options = useMemo(() => {
    const r = (node) => {}
    return r()
  }, [templateList])

  return (
    <Drawer size={600} {...rest} className={clsx(style, className)}>
      <Select<string>
        options={templateList}
        fieldNames={{ label: 'template_name', value: 'medical_id' }}
        value={$template}
        onChange={$setTemplate1}
        style={{ width: '100%' }}
      />
      <Tree treeData={options} />
    </Drawer>
  )
}
