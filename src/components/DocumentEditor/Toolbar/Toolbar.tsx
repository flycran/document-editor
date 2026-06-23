import { useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { SelectProps } from 'antd'
import {
  Button,
  ColorPicker,
  ConfigProvider,
  Divider,
  Dropdown,
  Select,
  Space,
  Tooltip,
} from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'
import { FaWpforms } from 'react-icons/fa'
import { ImPageBreak } from 'react-icons/im'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import {
  MdFingerprint,
  MdFormatAlignCenter,
  MdFormatAlignJustify,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdFormatBold,
  MdFormatClear,
  MdFormatColorFill,
  MdFormatColorText,
  MdFormatIndentDecrease,
  MdFormatIndentIncrease,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatUnderlined,
  MdLabelOutline,
  MdOutlineLocalPrintshop,
  MdOutlineStrikethroughS,
  MdRedo,
  MdSwapHoriz,
  MdUndo,
} from 'react-icons/md'
import { RiInputField } from 'react-icons/ri'
import {
  TbColumnInsertLeft,
  TbColumnInsertRight,
  TbColumnRemove,
  TbRowInsertBottom,
  TbRowInsertTop,
  TbRowRemove,
  TbTableMinus,
  TbTablePlus,
  TbVariablePlus,
} from 'react-icons/tb'
import { useDocumentEditor } from '../contexts/DocumentEditorContext'
import { usePreviewMode } from '../contexts/PreviewModeContext'
import { SginType, sginEnum } from '../extensions/SginNode/SginUtils'
import AliasModal from './AliasModal'
import styles from './Toolbar.module.scss'
import VariableForm from './VariableForm'

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48]

const FONT_SIZE_OPTIONS: SelectProps['options'] = FONT_SIZES.map((size) => ({
  label: `${size}px`,
  value: `${size}px`,
}))

const HEADING_OPTIONS: SelectProps['options'] = [
  { value: 'paragraph', label: '正文' },
  { value: 'heading1', label: '标题 1' },
  { value: 'heading2', label: '标题 2' },
  { value: 'heading3', label: '标题 3' },
]

const presetsColors = [
  '#BFEDD2',
  '#FBEEB8',
  '#F8CAC6',
  '#ECCAFA',
  '#C2E0F4',
  '#2DC26B',
  '#F1C40F',
  '#E03E2D',
  '#B96AD9',
  '#3598DB',
  '#169179',
  '#E67E23',
  '#BA372A',
  '#843FA1',
  '#236FA1',
  '#ECF0F1',
  '#CED4D9',
  '#95A5A6',
  '#7E8C8D',
  '#34495E',
  '#000000',
  '#FFFFFF',
]

// 表格行列数配置
const TABLE_SIZE_CONFIG = {
  min: 2,
  max: 8,
}

const useToolbarState = () => {
  const editor = useDocumentEditor()

  return useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor
      let textAlign: 'left' | 'center' | 'right' | 'justify' = 'left'
      if (e.isActive({ textAlign: 'center' })) textAlign = 'center'
      else if (e.isActive({ textAlign: 'right' })) textAlign = 'right'
      else if (e.isActive({ textAlign: 'justify' })) textAlign = 'justify'

      let headingLevel = 0
      if (e.isActive('heading', { level: 1 })) headingLevel = 1
      else if (e.isActive('heading', { level: 2 })) headingLevel = 2
      else if (e.isActive('heading', { level: 3 })) headingLevel = 3

      return {
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
        isBoldActive: e.isActive('bold'),
        isItalicActive: e.isActive('italic'),
        isUnderlineActive: e.isActive('underline'),
        isStrikeActive: e.isActive('strike'),
        isBulletListActive: e.isActive('bulletList'),
        isOrderedListActive: e.isActive('orderedList'),
        textAlign,
        headingLevel,
        fontSize: (e.getAttributes('textStyle').fontSize || '16px') as string,
        textColor: (e.getAttributes('textStyle').color || '#000000') as string,
        highlightColor: (e.getAttributes('highlight').color || '#ffff00') as string,
      }
    },
  })
}

type ToolbarState = ReturnType<typeof useToolbarState>

// 表格选择器组件
function TableSelector({ onSelect }: { onSelect: (rows: number, cols: number) => void }) {
  const [hoverSize, setHoverSize] = useState<[number, number]>([0, 0])
  const { max } = TABLE_SIZE_CONFIG

  const grid = Array.from({ length: max }, (_, rowIndex) =>
    Array.from({ length: max }, (_, colIndex) => {
      const isHovered = rowIndex < hoverSize[0] && colIndex < hoverSize[1]
      return (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={styles.tableGridCellWrapper}
          onMouseEnter={() => setHoverSize([rowIndex + 1, colIndex + 1])}
          onClick={() => onSelect(hoverSize[0], hoverSize[1])}
        >
          <div className={clsx(styles.tableGridCell, { [styles.tableGridCellHover]: isHovered })} />
        </div>
      )
    })
  )

  return (
    <div className={styles.tableSelector} onMouseLeave={() => setHoverSize([0, 0])}>
      <div className={styles.tableGrid}>{grid}</div>
      <div className={styles.tableSizeHint}>
        {hoverSize[0] > 0 && hoverSize[1] > 0
          ? `${hoverSize[0]} 行 × ${hoverSize[1]} 列`
          : '选择表格大小'}
      </div>
    </div>
  )
}

function BubbleToolbar({
  isPreview,
  editorState,
}: {
  isPreview: boolean
  editorState: ToolbarState
}) {
  const editor = useDocumentEditor()

  const selected = useEditorState({
    editor,
    selector: (state) => state.editor.state.selection,
  })
  const showLabelValue = useMemo(() => {
    const { from, to } = selected
    const nodes: { showLabel: boolean }[] = []
    editor.state.doc.nodesBetween(from, to, (node) => {
      if (node.type.name === 'variable') {
        nodes.push({
          showLabel: node.attrs.showLabel ?? true,
        })
      }
    })

    const allSameShowLabel =
      nodes.length > 0 && nodes.every((n) => n.showLabel === nodes[0].showLabel)

    return allSameShowLabel ? nodes[0].showLabel : undefined
  }, [selected])

  const [aliasModalOpen, setAliasModalOpen] = useState(false)

  const formatButtons = (
    <>
      <Tooltip title="加粗" placement="top">
        <Button
          type={editorState.isBoldActive ? 'primary' : 'text'}
          icon={<MdFormatBold />}
          disabled={isPreview}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
      </Tooltip>
      <Tooltip title="斜体" placement="top">
        <Button
          type={editorState.isItalicActive ? 'primary' : 'text'}
          icon={<MdFormatItalic />}
          disabled={isPreview}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
      </Tooltip>
      <Tooltip title="下划线" placement="top">
        <Button
          type={editorState.isUnderlineActive ? 'primary' : 'text'}
          icon={<MdFormatUnderlined />}
          disabled={isPreview}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
      </Tooltip>
      <Tooltip title="删除线" placement="top">
        <Button
          type={editorState.isStrikeActive ? 'primary' : 'text'}
          icon={<MdOutlineStrikethroughS />}
          disabled={isPreview}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
      </Tooltip>
      <Divider className={styles.divider} orientation="vertical" />
      <FormatColorButtons isPreview={isPreview} editorState={editorState} tooltipPlacement="top" />
      <Tooltip title="清除格式" placement="top">
        <Button
          type="text"
          icon={<MdFormatClear />}
          disabled={isPreview}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        />
      </Tooltip>
    </>
  )

  return (
    <ConfigProvider componentSize="small" tooltip={{ classNames: { root: styles.tooltip } }}>
      {/* 变量节点 */}
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-variable"
        className={styles.bubble}
        shouldShow={({ editor: ed }) => {
          return !isPreview && ed.isActive('variable')
        }}
      >
        <div className={styles.bubbleRow}>
          {formatButtons}
          <Divider className={styles.divider} orientation="vertical" />
          <Tooltip title="替换变量" placement="bottom">
            <Button
              type="text"
              icon={<MdSwapHoriz />}
              disabled={isPreview}
              onClick={() => {
                editor.chain().focus().toggleVariableDrawer('replace').run()
              }}
            />
          </Tooltip>
          <Tooltip title="设置别名" placement="bottom">
            <Button
              type="text"
              icon={<RiInputField />}
              disabled={isPreview}
              onClick={() => setAliasModalOpen(true)}
            />
          </Tooltip>
          <Tooltip title="显示字段名" placement="bottom">
            <Button
              type={showLabelValue ? 'primary' : 'text'}
              disabled={isPreview}
              icon={<MdLabelOutline />}
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .updateAttributes('variable', { showLabel: !showLabelValue })
                  .run()
              }}
            />
          </Tooltip>
        </div>
      </BubbleMenu>

      {/* 默认文本格式菜单 */}
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-text"
        className={styles.bubble}
        shouldShow={({ state, editor: ed }) => {
          if (isPreview) return false
          const { selection } = state
          // 分页符和变量节点不显示默认菜单
          if (ed.isActive('pageBreak') || ed.isActive('variable')) return false
          const { empty } = selection
          return !empty
        }}
      >
        <div className={styles.bubbleRow}>{formatButtons}</div>
      </BubbleMenu>

      <AliasModal open={aliasModalOpen} editor={editor} onClose={() => setAliasModalOpen(false)} />
    </ConfigProvider>
  )
}

function TableBubbleMenu({ isPreview }: { isPreview: boolean }) {
  const editor = useDocumentEditor()

  return (
    <ConfigProvider componentSize="small" tooltip={{ classNames: { root: styles.tooltip } }}>
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-table"
        className={styles.bubble}
        shouldShow={({ editor: ed }) => {
          return !isPreview && ed.isActive('table')
        }}
      >
        <div className={styles.bubbleRow}>
          <Tooltip title="在上方添加行">
            <Button
              type="text"
              icon={<TbRowInsertTop />}
              disabled={isPreview}
              onClick={() => editor.chain().focus().addRowBefore().run()}
            />
          </Tooltip>
          <Tooltip title="在下方添加行">
            <Button
              type="text"
              icon={<TbRowInsertBottom />}
              disabled={isPreview}
              onClick={() => editor.chain().focus().addRowAfter().run()}
            />
          </Tooltip>
          <Divider className={styles.divider} orientation="vertical" />
          <Tooltip title="在左侧添加列">
            <Button
              type="text"
              icon={<TbColumnInsertLeft />}
              disabled={isPreview}
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            />
          </Tooltip>
          <Tooltip title="在右侧添加列">
            <Button
              type="text"
              icon={<TbColumnInsertRight />}
              disabled={isPreview}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            />
          </Tooltip>
          <Divider className={styles.divider} orientation="vertical" />
          <Tooltip title="删除行">
            <Button
              type="text"
              icon={<TbRowRemove />}
              disabled={isPreview}
              onClick={() => editor.chain().focus().deleteRow().run()}
            />
          </Tooltip>
          <Tooltip title="删除列">
            <Button
              type="text"
              icon={<TbColumnRemove />}
              disabled={isPreview}
              onClick={() => editor.chain().focus().deleteColumn().run()}
            />
          </Tooltip>
          <Divider className={styles.divider} orientation="vertical" />
          <Tooltip title="删除表格">
            <Button
              type="text"
              icon={<TbTableMinus />}
              disabled={isPreview}
              onClick={() => editor.chain().focus().deleteTable().run()}
            />
          </Tooltip>
        </div>
      </BubbleMenu>
    </ConfigProvider>
  )
}

function FormatColorButtons({
  isPreview,
  editorState,
  tooltipPlacement,
}: {
  isPreview: boolean
  editorState: ToolbarState
  tooltipPlacement?: TooltipPlacement
}) {
  const editor = useDocumentEditor()

  return (
    <>
      <ColorPicker
        value={editorState.textColor}
        disabled={isPreview}
        presets={[
          {
            label: '预设',
            colors: presetsColors,
          },
        ]}
        onChange={(color) => {
          editor.chain().focus().setColor(color.toHexString()).run()
        }}
      >
        <Tooltip title="字体颜色" placement={tooltipPlacement}>
          <Button type="text" icon={<MdFormatColorText />} disabled={isPreview} />
        </Tooltip>
      </ColorPicker>

      <ColorPicker
        value={editorState.highlightColor}
        disabled={isPreview}
        presets={[
          {
            label: '预设',
            colors: presetsColors,
          },
        ]}
        onChange={(color) => {
          editor.chain().focus().toggleHighlight({ color: color.toHexString() }).run()
        }}
      >
        <Tooltip title="背景颜色" placement={tooltipPlacement}>
          <Button type="text" icon={<MdFormatColorFill />} disabled={isPreview} />
        </Tooltip>
      </ColorPicker>
    </>
  )
}

interface ToolbarProps {
  onPrint: () => void
}

export default function Toolbar({ onPrint }: ToolbarProps) {
  const editor = useDocumentEditor()
  const { isPreview, setPreview } = usePreviewMode()
  const [formOpen, setFormOpen] = useState(false)
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false)

  const editorState = useToolbarState()

  const currentHeading =
    editorState.headingLevel === 1
      ? '标题 1'
      : editorState.headingLevel === 2
        ? '标题 2'
        : editorState.headingLevel === 3
          ? '标题 3'
          : '正文'

  const handleHeadingClick = useCallback(
    (value: string) => {
      switch (value) {
        case 'paragraph':
          editor.chain().focus().setParagraph().run()
          break
        case 'heading1':
          editor.chain().focus().toggleHeading({ level: 1 }).run()
          break
        case 'heading2':
          editor.chain().focus().toggleHeading({ level: 2 }).run()
          break
        case 'heading3':
          editor.chain().focus().toggleHeading({ level: 3 }).run()
          break
      }
    },
    [editor]
  )

  const handlePrint = () => {
    if (!isPreview) {
      // flushSync 确保 setPreview(true) 同步完成渲染后再打印，
      // 避免变量值（AutoWidthInput）尚未渲染就触发打印
      flushSync(() => {
        setPreview(true)
      })
      onPrint()
      setPreview(false)
    } else {
      onPrint()
    }
  }

  return (
    <>
      <ConfigProvider componentSize="middle" tooltip={{ classNames: { root: styles.tooltip } }}>
        {/* 顶部工具栏 */}
        <div className={styles.toolbar}>
          {/* 第一行 */}
          <div className={styles.toolbarRow}>
            <Tooltip title="撤销" placement="top">
              <Button
                type="text"
                icon={<MdUndo />}
                disabled={!editorState.canUndo}
                onClick={() => editor.chain().focus().undo().run()}
              />
            </Tooltip>
            <Tooltip title="重做" placement="top">
              <Button
                type="text"
                icon={<MdRedo />}
                disabled={!editorState.canRedo}
                onClick={() => editor.chain().focus().redo().run()}
              />
            </Tooltip>

            <Divider className={styles.divider} orientation="vertical" />

            <Tooltip title="加粗" placement="top">
              <Button
                type={editorState.isBoldActive ? 'primary' : 'text'}
                icon={<MdFormatBold />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
            </Tooltip>
            <Tooltip title="斜体" placement="top">
              <Button
                type={editorState.isItalicActive ? 'primary' : 'text'}
                icon={<MdFormatItalic />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
            </Tooltip>
            <Tooltip title="下划线" placement="top">
              <Button
                type={editorState.isUnderlineActive ? 'primary' : 'text'}
                icon={<MdFormatUnderlined />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              />
            </Tooltip>
            <Tooltip title="删除线" placement="top">
              <Button
                type={editorState.isStrikeActive ? 'primary' : 'text'}
                icon={<MdOutlineStrikethroughS />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              />
            </Tooltip>

            <Divider className={styles.divider} orientation="vertical" />

            <Select
              showSearch={{ filterOption: true }}
              variant="filled"
              value={editorState.fontSize}
              options={FONT_SIZE_OPTIONS}
              style={{ width: 90 }}
              disabled={isPreview}
              onChange={(value) => {
                editor.chain().focus().setFontSize(value).run()
              }}
            />

            <Select
              variant="filled"
              options={HEADING_OPTIONS}
              value={currentHeading}
              style={{ width: 90 }}
              disabled={isPreview}
              onChange={handleHeadingClick}
            />

            <Divider className={styles.divider} orientation="vertical" />

            <Space.Compact>
              <Tooltip title="左对齐" placement="top">
                <Button
                  type={editorState.textAlign === 'left' ? 'primary' : 'text'}
                  icon={<MdFormatAlignLeft />}
                  disabled={isPreview}
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                />
              </Tooltip>
              <Tooltip title="居中" placement="top">
                <Button
                  type={editorState.textAlign === 'center' ? 'primary' : 'text'}
                  icon={<MdFormatAlignCenter />}
                  disabled={isPreview}
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                />
              </Tooltip>
              <Tooltip title="右对齐" placement="top">
                <Button
                  type={editorState.textAlign === 'right' ? 'primary' : 'text'}
                  icon={<MdFormatAlignRight />}
                  disabled={isPreview}
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                />
              </Tooltip>
              <Tooltip title="两端对齐" placement="top">
                <Button
                  type={editorState.textAlign === 'justify' ? 'primary' : 'text'}
                  icon={<MdFormatAlignJustify />}
                  disabled={isPreview}
                  onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                />
              </Tooltip>
            </Space.Compact>
          </div>

          {/* 第二行 */}
          <div className={styles.toolbarRow}>
            <Tooltip title="减少缩进" placement="bottom">
              <Button
                type="text"
                icon={<MdFormatIndentDecrease />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().outdent().run()}
              />
            </Tooltip>
            <Tooltip title="增加缩进" placement="bottom">
              <Button
                type="text"
                icon={<MdFormatIndentIncrease />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().indent().run()}
              />
            </Tooltip>

            <Divider className={styles.divider} orientation="vertical" />

            <Tooltip title="无序列表" placement="bottom">
              <Button
                type={editorState.isBulletListActive ? 'primary' : 'text'}
                icon={<MdFormatListBulleted />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              />
            </Tooltip>
            <Tooltip title="有序列表" placement="bottom">
              <Button
                type={editorState.isOrderedListActive ? 'primary' : 'text'}
                icon={<MdFormatListNumbered />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              />
            </Tooltip>

            <Divider className={styles.divider} orientation="vertical" />

            <FormatColorButtons
              isPreview={isPreview}
              editorState={editorState}
              tooltipPlacement="bottom"
            />

            <Tooltip title="清除格式" placement="bottom">
              <Button
                type="text"
                icon={<MdFormatClear />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              />
            </Tooltip>

            <Divider className={styles.divider} orientation="vertical" />

            <Dropdown
              open={tableDropdownOpen}
              onOpenChange={setTableDropdownOpen}
              popupRender={() => (
                <div className={styles.tableDropdown}>
                  <TableSelector
                    onSelect={(rows, cols) => {
                      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
                      setTableDropdownOpen(false)
                    }}
                  />
                </div>
              )}
              placement="bottomLeft"
            >
              <Tooltip title="插入表格" placement="top">
                <Button type="text" icon={<TbTablePlus />} disabled={isPreview} />
              </Tooltip>
            </Dropdown>

            <Tooltip title="插入分页符" placement="bottom">
              <Button
                type="text"
                icon={<ImPageBreak />}
                disabled={isPreview}
                onClick={() => editor.chain().focus().insertPageBreak().run()}
              />
            </Tooltip>

            <Tooltip title="插入变量" placement="bottom">
              <Button
                type="text"
                icon={<TbVariablePlus />}
                disabled={isPreview}
                data-tour-id="toolbar-variable"
                onClick={() => editor.chain().focus().toggleVariableDrawer('insert').run()}
              />
            </Tooltip>

            <Dropdown
              menu={{
                onClick: ({ key }) => {
                  editor
                    .chain()
                    .focus()
                    .insertFingerprint({ type: key as SginType })
                    .run()
                },
                items: Object.entries(sginEnum).map(([key, value]) => ({
                  key,
                  label: value,
                })),
              }}
              placement="bottomLeft"
            >
              <Tooltip title="插入签名" placement="top">
                <Button
                  type="text"
                  icon={<MdFingerprint />}
                  disabled={isPreview}
                  data-tour-id="toolbar-signature"
                />
              </Tooltip>
            </Dropdown>

            <Divider className={styles.divider} size="small" orientation="vertical" />

            <Tooltip title={isPreview ? '编辑' : '预览'} placement="bottom">
              <Button
                type="text"
                icon={isPreview ? <IoMdEyeOff /> : <IoMdEye />}
                data-tour-id="toolbar-preview"
                onClick={() => setPreview(!isPreview)}
              />
            </Tooltip>

            <Tooltip title="编辑预览变量" placement="bottom">
              <Button
                type="text"
                icon={<FaWpforms />}
                data-tour-id="toolbar-variable-form"
                onClick={() => setFormOpen(!formOpen)}
              />
            </Tooltip>

            <Tooltip title="打印" placement="bottom">
              <Button type="text" icon={<MdOutlineLocalPrintshop />} onClick={handlePrint} />
            </Tooltip>
          </div>
        </div>
      </ConfigProvider>

      <BubbleToolbar isPreview={isPreview} editorState={editorState} />
      <TableBubbleMenu isPreview={isPreview} />

      <VariableForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  )
}
