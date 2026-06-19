import { css } from '@emotion/css'
import { Select, Spin, Tree, TreeDataNode } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { MdAddCircleOutline } from 'react-icons/md'
import {
  GetQuestcenterInformedTemplateGetMedicalTemplateList200ListItem,
  InformedTemplateNodeListItem,
  InformedTemplateParagraphListItem,
} from '@/api/codegen/schemas'
import { useDocumentEditor } from '../DocumentEditor/contexts/DocumentEditorContext'
import type { VariableExtensionMode } from '../DocumentEditor/extensions/VariableExtension'

export interface InformedTemplateParagraphListItemTree extends TreeDataNode {
  children?: InformedTemplateParagraphListItemTree[]
  paragraph?: InformedTemplateParagraphListItem
  node?: InformedTemplateNodeListItem
}

function VariableListTitle({
  paragraph,
  node,
  mode,
}: InformedTemplateParagraphListItemTree & { mode: VariableExtensionMode }) {
  return paragraph ? (
    <VariableListParagraph {...paragraph} />
  ) : node ? (
    <VariableListNode node={node} mode={mode} />
  ) : null
}

function VariableListParagraph(props: InformedTemplateParagraphListItem) {
  return <span>{props.name}</span>
}

const nodeStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  vertical-align: top;
  color: var(--ant-color-primary);
`

function VariableListNode({
  node,
  mode,
}: {
  node: InformedTemplateNodeListItem
  mode: VariableExtensionMode
}) {
  const editor = useDocumentEditor()

  const handleClick = () => {
    const data = {
      key: node.code,
      label: node.node_name,
      code: node.code,
    }
    if (mode === 'replace' && editor.isActive('variable')) {
      // 替换模式：更新当前选中变量节点的属性
      editor.chain().focus().updateAttributes('variable', data).run()
    } else {
      // 插入模式（默认）：插入新变量节点
      editor.chain().focus().insertVariable(data).run()
    }
  }
  return (
    <span
      onClick={handleClick}
      className={nodeStyle}
      title={`点击${mode === 'replace' ? '替换' : '插入'}变量: ${node.code} ${node.node_name}`}
    >
      <MdAddCircleOutline className="plus-icon" size={18} />
      <span>{node.node_name}</span>
    </span>
  )
}

const viewStyle = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  .spin {
    min-height: 200px;
  }
`

export interface VariableListProps {
  /** 模板列表 */
  templateList?: GetQuestcenterInformedTemplateGetMedicalTemplateList200ListItem[]
  /** 模板列表加载中 */
  templateListLoading?: boolean
  /** 选中的模板 */
  templateValue?: string
  /** 变量列表 */
  variableList?: InformedTemplateParagraphListItem[]
  /** 变量列表加载中 */
  variableListLoading?: boolean
  /** 模板选中回调 */
  onTemplateSelect?: (templateMedicalId: string) => void
  /** 变量选择模式 */
  mode?: VariableExtensionMode
}

/** 变量选择视图 */
export default function VariableList({
  templateList,
  templateListLoading = false,
  templateValue,
  variableList,
  variableListLoading = false,
  onTemplateSelect,
  mode = 'insert',
}: VariableListProps) {
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
    const buildParagraphTree = (
      nodes: InformedTemplateParagraphListItem[]
    ): InformedTemplateParagraphListItemTree[] => {
      return nodes.map((paragraph) => {
        const children = paragraph.node_list
          ? buildNodeTree(paragraph.node_list)
          : paragraph.child_paragraph_list
            ? buildParagraphTree(paragraph.child_paragraph_list)
            : undefined
        return {
          disabled: !children?.length,
          title: paragraph.name,
          children,
          key: paragraph.paragraph_id,
          paragraph: paragraph,
        }
      })
    }
    const buildNodeTree = (
      nodes: InformedTemplateNodeListItem[]
    ): InformedTemplateParagraphListItemTree[] => {
      return nodes.map((node) => {
        return {
          title: node.node_name,
          children: node.child_nodes && buildNodeTree(node.child_nodes),
          key: node.node_id,
          node: node,
        }
      })
    }
    return variableList && buildParagraphTree(variableList)
  }, [variableList])

  return (
    <div className={viewStyle}>
      <Select<string>
        loading={templateListLoading}
        options={templateList}
        fieldNames={{ label: 'template_name', value: 'medical_id' }}
        value={$template}
        onChange={$setTemplate1}
        style={{ width: '100%' }}
      />
      <Spin spinning={variableListLoading} className="spin">
        <Tree
          treeData={options}
          titleRender={(item) => <VariableListTitle {...item} mode={mode} />}
          checkable={false}
          selectable={false}
        />
      </Spin>
    </div>
  )
}
