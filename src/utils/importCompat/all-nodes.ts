import {
  getQuestcenterInformedTemplateGetMedicalTemplateList,
  getQuestcenterInformedTemplateGetTemplateDetailByMedicalId,
} from '@/api/codegen/petstore'
import {
  InformedTemplateNodeListItem,
  InformedTemplateNodeListItemElementsItem,
  InformedTemplateParagraphListItem,
} from '@/api/codegen/schemas'

let downloadNodeed = false
const nodeMap = new Map<string, InformedTemplateNodeListItemElementsItem>()
const downloadNodes = async () => {
  const medicalTemplateListRes = await getQuestcenterInformedTemplateGetMedicalTemplateList()
  const medicalTemplateIds = medicalTemplateListRes.data.list.map((item) => item.medical_id)

  const TemplateDetailResList = await Promise.all(
    medicalTemplateIds.map((medical_id) =>
      getQuestcenterInformedTemplateGetTemplateDetailByMedicalId({ medical_id })
    )
  )

  const paragraphList: InformedTemplateParagraphListItem[] = []

  TemplateDetailResList.forEach((res) => {
    paragraphList.push(...res.data.paragraph_list)
  })

  const buildParagraphTree = (nodes: InformedTemplateParagraphListItem[]) => {
    nodes.forEach((paragraph) => {
      if (paragraph.child_paragraph_list) {
        buildParagraphTree(paragraph.child_paragraph_list)
      }
      if (paragraph.node_list) {
        buildNodeTree(paragraph.node_list)
      }
    })
  }
  const buildNodeTree = (nodes: InformedTemplateNodeListItem[]) => {
    nodes.forEach((node) => {
      if (node.has_child_node) {
        buildNodeTree(node.child_nodes)
      }
      if (node.has_element) {
        buildElementTree(node.elements)
      }
    })
  }

  const buildElementTree = (elements: InformedTemplateNodeListItemElementsItem[]) => {
    elements.forEach((element) => {
      nodeMap.set(element.code, element)
    })
  }

  buildParagraphTree(paragraphList)
}

export const getAllNodes = async () => {
  if (!downloadNodeed) {
    await downloadNodes()
    downloadNodeed = true
  }
  return nodeMap
}
