import { css } from '@emotion/css'
import { Drawer, DrawerProps, Select, Tree } from 'antd'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import {
  GetQuestcenterInformedTemplateGetMedicalTemplateList200ListItem,
  InformedTemplateNodeListItem,
  InformedTemplateParagraphListItem,
} from '@/api/codegen/schemas'
import { useDocumentEditor } from '../DocumentEditor/contexts/DocumentEditorContext'
import type { VariableViewMode } from '../DocumentEditor/extensions/VariableViewExtension'

interface InformedTemplateParagraphListItemTree {
  children?: InformedTemplateParagraphListItemTree[]
  title: string
  paragraph?: InformedTemplateParagraphListItem
  node?: InformedTemplateNodeListItem
  key: string
}

function VariableViewTitle({
  paragraph,
  node,
  mode,
}: InformedTemplateParagraphListItemTree & { mode: VariableViewMode }) {
  return paragraph ? (
    <VariableViewParagraph {...paragraph} />
  ) : node ? (
    <VariableViewNode node={node} mode={mode} />
  ) : null
}

function VariableViewParagraph(props: InformedTemplateParagraphListItem) {
  return <span>{props.name}</span>
}
function VariableViewNode({
  node,
  mode,
}: {
  node: InformedTemplateNodeListItem
  mode: VariableViewMode
}) {
  const editor = useDocumentEditor()

  const handleClick = () => {
    if (mode === 'replace' && editor.isActive('variable')) {
      // 替换模式：更新当前选中变量节点的属性
      editor
        .chain()
        .focus()
        .updateAttributes('variable', {
          key: node.code,
          label: node.node_name,
          code: node.code,
        })
        .run()
    } else {
      // 插入模式（默认）：插入新变量节点
      editor
        .chain()
        .focus()
        .insertVariable({
          key: node.code,
          label: node.node_name,
          code: node.code,
        })
        .run()
    }
  }
  return (
    <span
      onClick={handleClick}
      title={`点击${mode === 'replace' ? '替换' : '插入'}变量: ${node.code} ${node.node_name}`}
    >
      {node.node_name}
    </span>
  )
}

const style = css`
  .variable-view-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
`

export interface VariableViewProps extends DrawerProps {
  variableList?: InformedTemplateParagraphListItem[]
  templateList?: GetQuestcenterInformedTemplateGetMedicalTemplateList200ListItem[]
  templateValue?: string
  onTemplateSelect?: (templateMedicalId: string) => void
  /** 变量操作模式：insert（插入新节点）| replace（替换当前选中节点） */
  mode?: VariableViewMode
}

export default function VariableView({
  variableList,
  templateList,
  templateValue,
  onTemplateSelect,
  mode = 'insert',
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
    const rp = (
      nodes: InformedTemplateParagraphListItem[]
    ): InformedTemplateParagraphListItemTree[] => {
      return nodes.map((paragraph) => {
        const children = paragraph.node_list
          ? rn(paragraph.node_list)
          : paragraph.child_paragraph_list
            ? rp(paragraph.child_paragraph_list)
            : undefined
        return {
          title: paragraph.name,
          children,
          key: paragraph.paragraph_id,
          paragraph: paragraph,
        }
      })
    }
    const rn = (nodes: InformedTemplateNodeListItem[]): InformedTemplateParagraphListItemTree[] => {
      return nodes.map((node) => {
        return {
          title: node.node_name,
          children: node.child_nodes && rn(node.child_nodes),
          key: node.node_id,
          node: node,
        }
      })
    }
    return variableList && rp(variableList)
  }, [variableList])

  return (
    <Drawer size={600} {...rest} className={clsx(style, className)}>
      <div className="variable-view-body">
        <Select<string>
          options={templateList}
          fieldNames={{ label: 'template_name', value: 'medical_id' }}
          value={$template}
          onChange={$setTemplate1}
          style={{ width: '100%' }}
        />
        <Tree
          treeData={options}
          titleRender={(item) => <VariableViewTitle {...item} mode={mode} />}
          checkable={false}
          selectable={false}
        />
      </div>
    </Drawer>
  )
}
