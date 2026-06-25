import { Input, Select, Spin, Tree, TreeDataNode } from 'antd'
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MdAddCircleOutline } from 'react-icons/md'
import { RiNodeTree } from 'react-icons/ri'
import {
  GetQuestcenterInformedTemplateGetMedicalTemplateList200ListItem,
  InformedTemplateNodeListItem,
  InformedTemplateNodeListItemElementsItem,
  InformedTemplateParagraphListItem,
} from '@/api/codegen/schemas'
import { useDocumentEditor } from '../DocumentEditor/contexts/DocumentEditorContext'
import type { VariableExtensionMode } from '../DocumentEditor/extensions/VariableExtension'
import {
  VariableNodeAttrs,
  VariableType,
} from '../DocumentEditor/extensions/VariableNode/VariableNode'
import styles from './VariableList.module.scss'

export interface InformedTemplateItemTree extends TreeDataNode {
  children?: InformedTemplateItemTree[]
  paragraph?: InformedTemplateParagraphListItem
  node?: InformedTemplateNodeListItem
  element?: InformedTemplateNodeListItemElementsItem
}

/** 搜索值 Context：避免通过 props 逐层透传，searchValue 变化时只有真正用到它的组件重渲染 */
const SearchValueContext = createContext('')
const useSearchValue = () => useContext(SearchValueContext)

/** 变量操作模式 Context */
const VariableModeContext = createContext<VariableExtensionMode>('insert')
const useVariableMode = () => useContext(VariableModeContext)

/** 高亮搜索关键词 */
const HighlightText = memo(function HighlightText({ text }: { text: string }) {
  const keyword = useSearchValue()
  if (!keyword) return <>{text}</>
  const index = text.indexOf(keyword)
  if (index === -1) return <>{text}</>
  return (
    <>
      {text.substring(0, index)}
      <span className={styles.highlight}>{keyword}</span>
      {text.substring(index + keyword.length)}
    </>
  )
})

/** 变量列表标题 */
const VariableListTitle = memo(function VariableListTitle({
  paragraph,
  node,
  element,
}: InformedTemplateItemTree) {
  return paragraph ? (
    <VariableListParagraph paragraph={paragraph} />
  ) : node ? (
    <VariableListNode node={node} />
  ) : element ? (
    <VariableListElement element={element} />
  ) : null
})

/** 变量列表段落 */
const VariableListParagraph = memo(function VariableListParagraph({
  paragraph,
}: {
  paragraph: InformedTemplateParagraphListItem
}) {
  return (
    <span>
      <HighlightText text={paragraph.name} />
    </span>
  )
})

/** 变量列表节点 */
const VariableListNode = memo(function VariableListNode({
  node,
}: {
  node: InformedTemplateNodeListItem
}) {
  return (
    <span className={styles.node}>
      <RiNodeTree />
      <span>
        <HighlightText text={node.node_name} />
      </span>
    </span>
  )
})

/** 变量列表元素 */
const VariableListElement = memo(function VariableListElement({
  element,
}: {
  element: InformedTemplateNodeListItemElementsItem
}) {
  const editor = useDocumentEditor()
  const mode = useVariableMode()

  const handleClick = () => {
    const type: VariableType =
      element.is_bool === 1
        ? 'boolean'
        : element.is_number === 1
          ? 'number'
          : element.is_date === 1
            ? 'date'
            : element.is_time === 1
              ? 'time'
              : element.is_date_time === 1
                ? 'date-time'
                : 'text'

    const data: VariableNodeAttrs = {
      label: element.name,
      code: element.code,
      type,
    }
    if (mode === 'replace' && editor.isActive('variable')) {
      // 替换模式：更新当前选中变量节点的属性
      editor.chain().focus().updateAttributes('variable', data).run()
    } else {
      // 插入模式（默认）：插入新变量节点
      editor.chain().focus().insertVariable(data).run()
    }
    if (editor.storage.variableExtension.mode === 'replace') editor.commands.closeVariableDrawer()
  }
  return (
    <span
      onClick={handleClick}
      className={styles.element}
      title={`点击${mode === 'replace' ? '替换' : '插入'}变量: ${element.code} ${element.name}`}
    >
      <MdAddCircleOutline className={styles['before-icon']} size={18} />
      <span>
        <HighlightText text={element.name} />
      </span>
    </span>
  )
})

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
  /** Tour 引导锚点 ID */
  dataTourId?: string
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
  dataTourId,
}: VariableListProps) {
  const [$template, $setTemplate1] = useState<string>()
  const [searchValue, setSearchValue] = useState('')
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)

  // 稳定 titleRender 引用：mode/searchValue 通过 Context 传递，回调本身不依赖它们
  const titleRender = useCallback(
    (item: InformedTemplateItemTree) => <VariableListTitle {...item} />,
    []
  )

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

  // 构建原始树数据
  const rawTreeData = useMemo(() => {
    const buildParagraphTree = (
      nodes: InformedTemplateParagraphListItem[]
    ): InformedTemplateItemTree[] => {
      return nodes.map((paragraph) => {
        const children: InformedTemplateItemTree[] = []
        if (paragraph.child_paragraph_list) {
          children.push(...buildParagraphTree(paragraph.child_paragraph_list))
        }
        if (paragraph.node_list) {
          children.push(...buildNodeTree(paragraph.node_list))
        }
        return {
          title: paragraph.name,
          children,
          key: `paragraph-${paragraph.paragraph_id}`,
          paragraph: paragraph,
        }
      })
    }
    const buildNodeTree = (nodes: InformedTemplateNodeListItem[]): InformedTemplateItemTree[] => {
      return nodes.map((node) => {
        const children: InformedTemplateItemTree[] = []
        if (node.has_child_node) {
          children.push(...buildNodeTree(node.child_nodes))
        }
        if (node.has_element) {
          children.push(...buildElementTree(node.elements))
        }

        return {
          title: node.node_name,
          children,
          key: `node-${node.node_id}`,
          node: node,
        }
      })
    }

    const buildElementTree = (
      elements: InformedTemplateNodeListItemElementsItem[]
    ): InformedTemplateItemTree[] => {
      return elements.map((element) => {
        return {
          title: element.name,
          key: `element-${element.id}-${Math.random()}`,
          element: element,
        }
      })
    }

    return variableList && buildParagraphTree(variableList)
  }, [variableList])

  // 扁平化数据列表，用于搜索匹配
  const dataList = useMemo(() => {
    const list: { key: React.Key; title: string }[] = []
    const generateList = (data: InformedTemplateItemTree[]) => {
      for (const node of data) {
        const { key, title } = node
        list.push({ key, title: title as string })
        if (node.children) {
          generateList(node.children)
        }
      }
    }
    if (rawTreeData) {
      generateList(rawTreeData)
    }
    return list
  }, [rawTreeData])

  // 获取父节点 key，用于搜索时自动展开
  const getParentKey = useCallback(
    (key: React.Key, tree: InformedTemplateItemTree[]): React.Key | undefined => {
      for (const node of tree) {
        if (node.children) {
          if (node.children.some((item) => item.key === key)) {
            return node.key
          }
          const parentKey = getParentKey(key, node.children)
          if (parentKey) {
            return parentKey
          }
        }
      }
      return undefined
    },
    []
  )

  // 搜索处理
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      const newExpandedKeys = dataList
        .map((item) => {
          if (item.title.includes(value)) {
            return getParentKey(item.key, rawTreeData || [])
          }
          return null
        })
        .filter((item, i, self): item is React.Key => !!(item && self.indexOf(item) === i))
      setExpandedKeys(value ? newExpandedKeys : [])
      setSearchValue(value)
      setAutoExpandParent(true)
    },
    [dataList, rawTreeData, getParentKey]
  )

  const handleExpand = useCallback((newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys)
    setAutoExpandParent(false)
  }, [])

  return (
    <div className={styles.view} data-tour-id={dataTourId}>
      <div className={styles.template}>
        <Select<string>
          loading={templateListLoading}
          options={templateList}
          fieldNames={{ label: 'template_name', value: 'medical_id' }}
          value={$template}
          onChange={$setTemplate1}
          style={{ width: '100%' }}
        />
        <Input.Search
          className={styles.search}
          placeholder="搜索变量"
          onChange={handleSearchChange}
          value={searchValue}
          allowClear
        />
      </div>
      <VariableModeContext.Provider value={mode}>
        <SearchValueContext.Provider value={searchValue}>
          <Spin spinning={variableListLoading} className={styles.spin}>
            <Tree
              treeData={rawTreeData}
              titleRender={titleRender}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onExpand={handleExpand}
              checkable={false}
              selectable={false}
            />
          </Spin>
        </SearchValueContext.Provider>
      </VariableModeContext.Provider>
    </div>
  )
}
