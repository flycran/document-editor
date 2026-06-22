import { useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { SelectProps } from 'antd'
import { Button, ColorPicker, ConfigProvider, Divider, Dropdown, Select, Space } from 'antd'
import React, { useCallback, useState } from 'react'
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
  MdOutlineStrikethroughS,
  MdRedo,
  MdSwapHoriz,
  MdUndo,
} from 'react-icons/md'
import { RiInputField } from 'react-icons/ri'
import { TbVariablePlus } from 'react-icons/tb'
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

function BubbleToolbar({
  formatColor,
  isPreview,
  editorState,
}: {
  formatColor: React.ReactNode
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
      <Button
        type={editorState.isBoldActive ? 'primary' : 'text'}
        icon={<MdFormatBold />}
        disabled={isPreview}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Button
        type={editorState.isItalicActive ? 'primary' : 'text'}
        icon={<MdFormatItalic />}
        disabled={isPreview}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Button
        type={editorState.isUnderlineActive ? 'primary' : 'text'}
        icon={<MdFormatUnderlined />}
        disabled={isPreview}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Button
        type={editorState.isStrikeActive ? 'primary' : 'text'}
        icon={<MdOutlineStrikethroughS />}
        disabled={isPreview}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <Divider className={styles.divider} orientation="vertical" />
      {formatColor}
      <Button
        type="text"
        icon={<MdFormatClear />}
        disabled={isPreview}
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      />
    </>
  )

  return (
    <ConfigProvider componentSize="small">
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
          <Button
            type="text"
            icon={<MdSwapHoriz />}
            title="替换变量"
            disabled={isPreview}
            onClick={() => {
              editor.chain().focus().toggleVariableDrawer('replace').run()
            }}
          />
          <Button
            type="text"
            icon={<RiInputField />}
            title="设置别名"
            disabled={isPreview}
            onClick={() => setAliasModalOpen(true)}
          />
          <Button
            type={showLabelValue ? 'primary' : 'text'}
            disabled={isPreview}
            title="显示字段名"
            icon={<MdLabelOutline />}
            onClick={() => {
              editor
                .chain()
                .focus()
                .updateAttributes('variable', { showLabel: !showLabelValue })
                .run()
            }}
          />
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

      <AliasModal
        open={aliasModalOpen}
        editor={editor}
        onClose={(alias) => {
          setAliasModalOpen(false)
        }}
      />
    </ConfigProvider>
  )
}

interface ToolbarProps {}

export default function Toolbar({}: ToolbarProps) {
  const editor = useDocumentEditor()
  const { isPreview, setPreview } = usePreviewMode()
  const [formOpen, setFormOpen] = useState(false)

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

  const formatColor = (
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
        <Button type="text" icon={<MdFormatColorText />} title="字体颜色" disabled={isPreview} />
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
        <Button type="text" icon={<MdFormatColorFill />} title="背景颜色" disabled={isPreview} />
      </ColorPicker>
    </>
  )

  return (
    <>
      <ConfigProvider componentSize="middle">
        {/* 顶部工具栏 */}
        <div className={styles.toolbar}>
          {/* 第一行 */}
          <div className={styles.toolbarRow}>
            <Button
              type="text"
              icon={<MdUndo />}
              disabled={!editorState.canUndo}
              title="撤销"
              onClick={() => editor.chain().focus().undo().run()}
            />
            <Button
              type="text"
              icon={<MdRedo />}
              disabled={!editorState.canRedo}
              title="重做"
              onClick={() => editor.chain().focus().redo().run()}
            />

            <Divider className={styles.divider} orientation="vertical" />

            <Button
              type={editorState.isBoldActive ? 'primary' : 'text'}
              icon={<MdFormatBold />}
              title="加粗"
              disabled={isPreview}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <Button
              type={editorState.isItalicActive ? 'primary' : 'text'}
              icon={<MdFormatItalic />}
              title="斜体"
              disabled={isPreview}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <Button
              type={editorState.isUnderlineActive ? 'primary' : 'text'}
              icon={<MdFormatUnderlined />}
              title="下划线"
              disabled={isPreview}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <Button
              type={editorState.isStrikeActive ? 'primary' : 'text'}
              icon={<MdOutlineStrikethroughS />}
              title="删除线"
              disabled={isPreview}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />

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
              <Button
                type={editorState.textAlign === 'left' ? 'primary' : 'text'}
                icon={<MdFormatAlignLeft />}
                title="左对齐"
                disabled={isPreview}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
              />
              <Button
                type={editorState.textAlign === 'center' ? 'primary' : 'text'}
                icon={<MdFormatAlignCenter />}
                title="居中"
                disabled={isPreview}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
              />
              <Button
                type={editorState.textAlign === 'right' ? 'primary' : 'text'}
                icon={<MdFormatAlignRight />}
                title="右对齐"
                disabled={isPreview}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
              />
              <Button
                type={editorState.textAlign === 'justify' ? 'primary' : 'text'}
                icon={<MdFormatAlignJustify />}
                title="两端对齐"
                disabled={isPreview}
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              />
            </Space.Compact>
          </div>

          {/* 第二行 */}
          <div className={styles.toolbarRow}>
            <Button
              type="text"
              icon={<MdFormatIndentDecrease />}
              title="减少缩进"
              disabled={isPreview}
              onClick={() => editor.chain().focus().outdent().run()}
            />
            <Button
              type="text"
              icon={<MdFormatIndentIncrease />}
              title="增加缩进"
              disabled={isPreview}
              onClick={() => editor.chain().focus().indent().run()}
            />

            <Divider className={styles.divider} orientation="vertical" />

            <Button
              type={editorState.isBulletListActive ? 'primary' : 'text'}
              icon={<MdFormatListBulleted />}
              title="无序列表"
              disabled={isPreview}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <Button
              type={editorState.isOrderedListActive ? 'primary' : 'text'}
              icon={<MdFormatListNumbered />}
              title="有序列表"
              disabled={isPreview}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />

            <Divider className={styles.divider} orientation="vertical" />

            {formatColor}

            <Button
              type="text"
              icon={<MdFormatClear />}
              title="清除格式"
              disabled={isPreview}
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            />

            <Divider className={styles.divider} orientation="vertical" />

            <Button
              type="text"
              icon={<TbVariablePlus />}
              title="插入变量"
              disabled={isPreview}
              data-tour-id="toolbar-variable"
              onClick={() => editor.chain().focus().toggleVariableDrawer('insert').run()}
            />

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
              <Button
                type="text"
                icon={<MdFingerprint />}
                title="插入签名"
                disabled={isPreview}
                data-tour-id="toolbar-signature"
              />
            </Dropdown>

            <Button
              type="text"
              title="插入分页符"
              icon={<ImPageBreak />}
              disabled={isPreview}
              onClick={() => editor.chain().focus().insertPageBreak().run()}
            />

            <Divider className={styles.divider} size="small" orientation="vertical" />

            <Button
              type="text"
              icon={isPreview ? <IoMdEyeOff /> : <IoMdEye />}
              title={isPreview ? '编辑' : '预览'}
              data-tour-id="toolbar-preview"
              onClick={() => setPreview(!isPreview)}
            />

            <Button
              type="text"
              icon={<FaWpforms />}
              title="编辑预览变量"
              data-tour-id="toolbar-variable-form"
              onClick={() => setFormOpen(!formOpen)}
            />
          </div>
        </div>
      </ConfigProvider>

      <BubbleToolbar isPreview={isPreview} formatColor={formatColor} editorState={editorState} />

      <VariableForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  )
}
