import { useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { SelectProps } from 'antd'
import {
  App,
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
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'
import { FaWpforms } from 'react-icons/fa'
import { ImPageBreak } from 'react-icons/im'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import { LuSave } from 'react-icons/lu'
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
  TbFileExport,
  TbFileImport,
  TbHelp,
  TbRowInsertBottom,
  TbRowInsertTop,
  TbRowRemove,
  TbTableMinus,
  TbTablePlus,
  TbVariablePlus,
} from 'react-icons/tb'
import { useDocumentEditor } from '../contexts/DocumentEditorContext'
import { editableAtom, tourOpenAtom } from '../DocumentEditorStore'
import { SginType, sginEnum } from '../extensions/SginNode/SginUtils'
import AliasModal from './AliasModal'
import ImportExportModal from './ImportExportModal'
import styles from './Toolbar.module.scss'
import VariableForm from './VariableForm'

/**
 * 将文本复制到剪贴板
 * 优先使用 Clipboard API，不支持时降级到 execCommand('copy')
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {}
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.top = '-9999px'
    textarea.style.left = '-9999px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36]

const FONT_SIZE_OPTIONS: SelectProps['options'] = FONT_SIZES.map((size) => ({
  label: `${size}pt`,
  value: `${size}pt`,
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
        fontSize: (e.getAttributes('textStyle').fontSize || '12pt') as string,
        textColor: (e.getAttributes('textStyle').color || '#000000') as string,
        highlightColor: (e.getAttributes('highlight').color || '#ffff00') as string,
      }
    },
  })
}

const ToolbarStateContext = createContext<ToolbarState | null>(null)

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

/** 格式化颜色控件 */
function FormatColorControls({ tooltipPlacement }: { tooltipPlacement?: TooltipPlacement }) {
  const editorState = useContext(ToolbarStateContext)!
  const editor = useDocumentEditor()
  const editable = useAtomValue(editableAtom)

  return (
    <>
      <ColorPicker
        value={editorState.textColor}
        disabled={!editable}
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
          <Button type="text" icon={<MdFormatColorText />} disabled={!editable} />
        </Tooltip>
      </ColorPicker>

      <ColorPicker
        value={editorState.highlightColor}
        disabled={!editable}
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
          <Button type="text" icon={<MdFormatColorFill />} disabled={!editable} />
        </Tooltip>
      </ColorPicker>
    </>
  )
}

/** 格式化控件 */
const FormatControls = () => {
  const editorState = useContext(ToolbarStateContext)!
  const editor = useDocumentEditor()
  const editable = useAtomValue(editableAtom)
  return (
    <>
      <Tooltip title="加粗" placement="top">
        <Button
          type={editorState.isBoldActive ? 'primary' : 'text'}
          icon={<MdFormatBold />}
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
      </Tooltip>
      <Tooltip title="斜体" placement="top">
        <Button
          type={editorState.isItalicActive ? 'primary' : 'text'}
          icon={<MdFormatItalic />}
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
      </Tooltip>
      <Tooltip title="下划线" placement="top">
        <Button
          type={editorState.isUnderlineActive ? 'primary' : 'text'}
          icon={<MdFormatUnderlined />}
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
      </Tooltip>
      <Tooltip title="删除线" placement="top">
        <Button
          type={editorState.isStrikeActive ? 'primary' : 'text'}
          icon={<MdOutlineStrikethroughS />}
          disabled={!editable}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
      </Tooltip>
      <Divider className={styles.divider} orientation="vertical" />
      <FormatColorControls tooltipPlacement="top" />
      <Tooltip title="清除格式" placement="top">
        <Button
          type="text"
          icon={<MdFormatClear />}
          disabled={!editable}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        />
      </Tooltip>
    </>
  )
}

function VariableBubbleMenu() {
  const editor = useDocumentEditor()
  const editable = useAtomValue(editableAtom)
  const [aliasModalOpen, setAliasModalOpen] = useState(false)

  const { showLabelValue } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      showLabelValue: editor.isActive('variable', { showLabel: true }),
    }),
  })

  return (
    <>
      <FormatControls />
      <Divider className={styles.divider} orientation="vertical" />
      <Tooltip title="替换变量" placement="bottom">
        <Button
          type="text"
          icon={<MdSwapHoriz />}
          disabled={!editable}
          onClick={() => {
            editor.chain().focus().toggleVariableDrawer('replace').run()
          }}
        />
      </Tooltip>
      <Tooltip title="设置别名" placement="bottom">
        <Button
          type="text"
          icon={<RiInputField />}
          disabled={!editable}
          onClick={() => setAliasModalOpen(true)}
        />
      </Tooltip>
      <Tooltip title="显示字段名" placement="bottom">
        <Button
          type={showLabelValue ? 'primary' : 'text'}
          disabled={!editable}
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
      <ConfigProvider componentSize="medium">
        <AliasModal
          nodeType="variable"
          open={aliasModalOpen}
          editor={editor}
          onClose={() => setAliasModalOpen(false)}
        />
      </ConfigProvider>
    </>
  )
}

function SginBubbleMenu() {
  const editor = useDocumentEditor()
  const editable = useAtomValue(editableAtom)
  const [aliasModalOpen, setAliasModalOpen] = useState(false)

  const { showLabelValue } = useEditorState({
    editor,
    selector: ({ editor }) => ({
      showLabelValue: editor.isActive('sgin', { showLabel: true }),
    }),
  })

  return (
    <>
      <FormatControls />
      <Divider className={styles.divider} orientation="vertical" />
      <Tooltip title="设置别名" placement="bottom">
        <Button
          type="text"
          icon={<RiInputField />}
          disabled={!editable}
          onClick={() => setAliasModalOpen(true)}
        />
      </Tooltip>
      <Tooltip title="显示字段名" placement="bottom">
        <Button
          type={showLabelValue ? 'primary' : 'text'}
          disabled={!editable}
          icon={<MdLabelOutline />}
          onClick={() => {
            editor.chain().focus().updateAttributes('sgin', { showLabel: !showLabelValue }).run()
          }}
        />
      </Tooltip>
      <ConfigProvider componentSize="medium">
        <AliasModal
          nodeType="sgin"
          open={aliasModalOpen}
          editor={editor}
          onClose={() => setAliasModalOpen(false)}
        />
      </ConfigProvider>
    </>
  )
}

function BubbleToolbar() {
  const editor = useDocumentEditor()
  const editable = useAtomValue(editableAtom)

  return (
    <ConfigProvider componentSize="small" tooltip={{ classNames: { root: styles.tooltip } }}>
      {/* 变量节点 */}
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-variable"
        className={styles.bubble}
        shouldShow={({ editor: ed }) => {
          return editable && ed.isActive('variable')
        }}
      >
        <div className={styles.bubbleRow}>
          <VariableBubbleMenu />
        </div>
      </BubbleMenu>

      {/* 签名节点 */}
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-sgin"
        className={styles.bubble}
        shouldShow={({ editor: ed }) => {
          return editable && ed.isActive('sgin')
        }}
      >
        <div className={styles.bubbleRow}>
          <SginBubbleMenu />
        </div>
      </BubbleMenu>

      {/* 默认文本格式菜单 */}
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-text"
        className={styles.bubble}
        shouldShow={({ state, editor: ed }) => {
          if (!editable) return false
          const { selection } = state
          // 分页符和变量节点不显示默认菜单
          if (ed.isActive('pageBreak') || ed.isActive('variable') || ed.isActive('sgin'))
            return false
          const { empty } = selection
          return !empty
        }}
      >
        <div className={styles.bubbleRow}>
          <FormatControls />
        </div>
      </BubbleMenu>
      <TableBubbleMenu />
    </ConfigProvider>
  )
}

function TableBubbleMenu() {
  const editor = useDocumentEditor()
  const editable = useAtomValue(editableAtom)

  return (
    <ConfigProvider componentSize="small" tooltip={{ classNames: { root: styles.tooltip } }}>
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-table"
        className={styles.bubble}
        shouldShow={({ editor: ed }) => {
          return editable && ed.isActive('table')
        }}
        options={{
          autoPlacement: true,
        }}
      >
        <div className={styles.bubbleRow}>
          <Tooltip title="在上方添加行">
            <Button
              type="text"
              icon={<TbRowInsertTop />}
              disabled={!editable}
              onClick={() => editor.chain().focus().addRowBefore().run()}
            />
          </Tooltip>
          <Tooltip title="在下方添加行">
            <Button
              type="text"
              icon={<TbRowInsertBottom />}
              disabled={!editable}
              onClick={() => editor.chain().focus().addRowAfter().run()}
            />
          </Tooltip>
          <Divider className={styles.divider} orientation="vertical" />
          <Tooltip title="在左侧添加列">
            <Button
              type="text"
              icon={<TbColumnInsertLeft />}
              disabled={!editable}
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            />
          </Tooltip>
          <Tooltip title="在右侧添加列">
            <Button
              type="text"
              icon={<TbColumnInsertRight />}
              disabled={!editable}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            />
          </Tooltip>
          <Divider className={styles.divider} orientation="vertical" />
          <Tooltip title="删除行">
            <Button
              type="text"
              icon={<TbRowRemove />}
              disabled={!editable}
              onClick={() => editor.chain().focus().deleteRow().run()}
            />
          </Tooltip>
          <Tooltip title="删除列">
            <Button
              type="text"
              icon={<TbColumnRemove />}
              disabled={!editable}
              onClick={() => editor.chain().focus().deleteColumn().run()}
            />
          </Tooltip>
          <Divider className={styles.divider} orientation="vertical" />
          <Tooltip title="删除表格">
            <Button
              type="text"
              icon={<TbTableMinus />}
              disabled={!editable}
              onClick={() => editor.chain().focus().deleteTable().run()}
            />
          </Tooltip>
        </div>
      </BubbleMenu>
    </ConfigProvider>
  )
}

function ImportExportToolbar() {
  const editor = useDocumentEditor()
  const { message } = App.useApp()
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleImport = () => {
    setImportOpen(true)
  }

  const handleExport = async () => {
    const html = editor.getHTML()
    setExporting(true)
    try {
      const ok = await copyToClipboard(html)
      if (ok) {
        message.success('已复制 HTML 到剪贴板')
      } else {
        message.error('复制失败，请检查浏览器权限')
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <Tooltip title="导入" placement="bottom">
        <Button type="text" icon={<TbFileImport />} onClick={handleImport} />
      </Tooltip>

      <Tooltip title="导出" placement="bottom">
        <Button type="text" icon={<TbFileExport />} loading={exporting} onClick={handleExport} />
      </Tooltip>

      <ImportExportModal open={importOpen} editor={editor} onClose={() => setImportOpen(false)} />
    </>
  )
}

function HeaderToolber({ onPrint, onSave }: ToolbarProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [tableDropdownOpen, setTableDropdownOpen] = useState(false)
  const setTourOpen = useSetAtom(tourOpenAtom)
  const editor = useDocumentEditor()
  const [editable, setEditable] = useAtom(editableAtom)
  const editorState = useContext(ToolbarStateContext)!

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
    if (editable) {
      flushSync(() => {
        setEditable(false)
      })
      onPrint()
      setEditable(true)
    } else {
      onPrint()
    }
  }

  const [saveing, setSaveing] = useState(false)

  const handleSave = async () => {
    if (!onSave) return
    try {
      setSaveing(true)
      await onSave()
    } finally {
      setSaveing(false)
    }
  }

  return (
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
              disabled={!editable}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>
          <Tooltip title="斜体" placement="top">
            <Button
              type={editorState.isItalicActive ? 'primary' : 'text'}
              icon={<MdFormatItalic />}
              disabled={!editable}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </Tooltip>
          <Tooltip title="下划线" placement="top">
            <Button
              type={editorState.isUnderlineActive ? 'primary' : 'text'}
              icon={<MdFormatUnderlined />}
              disabled={!editable}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
          </Tooltip>
          <Tooltip title="删除线" placement="top">
            <Button
              type={editorState.isStrikeActive ? 'primary' : 'text'}
              icon={<MdOutlineStrikethroughS />}
              disabled={!editable}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
          </Tooltip>

          <Tooltip title="清除格式" placement="bottom">
            <Button
              type="text"
              icon={<MdFormatClear />}
              disabled={!editable}
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            />
          </Tooltip>

          <Divider className={styles.divider} orientation="vertical" />

          <Select
            showSearch={{ filterOption: true }}
            variant="filled"
            value={editorState.fontSize}
            options={FONT_SIZE_OPTIONS}
            style={{ width: 100 }}
            disabled={!editable}
            onChange={(value) => {
              editor.chain().focus().setFontSize(value).run()
            }}
          />

          <Select
            variant="filled"
            options={HEADING_OPTIONS}
            value={currentHeading}
            style={{ width: 100 }}
            disabled={!editable}
            onChange={handleHeadingClick}
          />

          <Divider className={styles.divider} orientation="vertical" />

          <Space.Compact>
            <Tooltip title="左对齐" placement="top">
              <Button
                type={editorState.textAlign === 'left' ? 'primary' : 'text'}
                icon={<MdFormatAlignLeft />}
                disabled={!editable}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
              />
            </Tooltip>
            <Tooltip title="居中" placement="top">
              <Button
                type={editorState.textAlign === 'center' ? 'primary' : 'text'}
                icon={<MdFormatAlignCenter />}
                disabled={!editable}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
              />
            </Tooltip>
            <Tooltip title="右对齐" placement="top">
              <Button
                type={editorState.textAlign === 'right' ? 'primary' : 'text'}
                icon={<MdFormatAlignRight />}
                disabled={!editable}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
              />
            </Tooltip>
            <Tooltip title="两端对齐" placement="top">
              <Button
                type={editorState.textAlign === 'justify' ? 'primary' : 'text'}
                icon={<MdFormatAlignJustify />}
                disabled={!editable}
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
              disabled={!editable}
              onClick={() => editor.chain().focus().outdent().run()}
            />
          </Tooltip>
          <Tooltip title="增加缩进" placement="bottom">
            <Button
              type="text"
              icon={<MdFormatIndentIncrease />}
              disabled={!editable}
              onClick={() => editor.chain().focus().indent().run()}
            />
          </Tooltip>

          <Divider className={styles.divider} orientation="vertical" />

          <Tooltip title="无序列表" placement="bottom">
            <Button
              type={editorState.isBulletListActive ? 'primary' : 'text'}
              icon={<MdFormatListBulleted />}
              disabled={!editable}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
          </Tooltip>
          <Tooltip title="有序列表" placement="bottom">
            <Button
              type={editorState.isOrderedListActive ? 'primary' : 'text'}
              icon={<MdFormatListNumbered />}
              disabled={!editable}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </Tooltip>

          <Divider className={styles.divider} orientation="vertical" />

          <FormatColorControls tooltipPlacement="bottom" />

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
              <Button type="text" icon={<TbTablePlus />} disabled={!editable} />
            </Tooltip>
          </Dropdown>

          <Tooltip title="插入分页符" placement="bottom">
            <Button
              type="text"
              icon={<ImPageBreak />}
              disabled={!editable}
              onClick={() => editor.chain().focus().insertPageBreak().run()}
            />
          </Tooltip>

          <Tooltip title="插入变量" placement="bottom">
            <Button
              type="text"
              icon={<TbVariablePlus />}
              disabled={!editable}
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
                disabled={!editable}
                data-tour-id="toolbar-signature"
              />
            </Tooltip>
          </Dropdown>

          <Divider className={styles.divider} size="small" orientation="vertical" />

          <Tooltip title={!editable ? '编辑' : '预览'} placement="bottom">
            <Button
              type="text"
              icon={!editable ? <IoMdEyeOff /> : <IoMdEye />}
              data-tour-id="toolbar-preview"
              onClick={() => setEditable(!editable)}
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

          <Divider className={styles.divider} size="small" orientation="vertical" />

          <ImportExportToolbar />

          <Divider className={styles.divider} size="small" orientation="vertical" />

          <Tooltip title="保存" placement="bottom">
            <Button type="text" icon={<LuSave />} loading={saveing} onClick={handleSave} />
          </Tooltip>

          <Tooltip title="使用帮助" placement="bottom">
            <Button type="text" icon={<TbHelp />} onClick={() => setTourOpen(true)} />
          </Tooltip>
        </div>
      </div>
      <VariableForm open={formOpen} onClose={() => setFormOpen(false)} />
    </ConfigProvider>
  )
}

interface ToolbarProps {
  onPrint: () => void
  onSave?: () => void
}

export default function Toolbar({ onPrint }: ToolbarProps) {
  const editorState = useToolbarState()

  return (
    <>
      <ToolbarStateContext value={editorState}>
        <HeaderToolber onPrint={onPrint} />
        <BubbleToolbar />
      </ToolbarStateContext>
    </>
  )
}
