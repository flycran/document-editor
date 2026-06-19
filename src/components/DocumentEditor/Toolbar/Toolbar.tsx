import { css } from '@emotion/css'
import { useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { SelectProps } from 'antd'
import { Button, ColorPicker, ConfigProvider, Divider, Select, Space } from 'antd'
import { useCallback } from 'react'
import { ImPageBreak } from 'react-icons/im'
import { IoMdEye, IoMdEyeOff } from 'react-icons/io'
import {
  MdFormatAlignCenter,
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
  MdModeEditOutline,
  MdOutlineStrikethroughS,
  MdRedo,
  MdUndo,
} from 'react-icons/md'
import { TbVariablePlus } from 'react-icons/tb'
import { useDocumentEditor } from '../contexts/DocumentEditorContext'
import { usePreviewMode } from '../contexts/PreviewModeContext'

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

const toolbarStyles = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`

const toolbarRowStyles = css`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
`

const bubbleStyles = css`
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 4px;
`

const bubbleRowStyles = css`
  display: flex;
  align-items: center;
  gap: 4px;
`

const dividerStyles = css`
  margin: 4px;
`

interface ToolbarProps {}

export default function Toolbar({}: ToolbarProps) {
  const editor = useDocumentEditor()
  const { isPreview, setPreview } = usePreviewMode()
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor
      let textAlign: 'left' | 'center' | 'right' = 'left'
      if (e.isActive({ textAlign: 'center' })) textAlign = 'center'
      else if (e.isActive({ textAlign: 'right' })) textAlign = 'right'

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

  const formatButtons = (
    <>
      <Button
        type={editorState.isBoldActive ? 'primary' : 'text'}
        icon={<MdFormatBold />}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Button
        type={editorState.isItalicActive ? 'primary' : 'text'}
        icon={<MdFormatItalic />}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Button
        type={editorState.isUnderlineActive ? 'primary' : 'text'}
        icon={<MdFormatUnderlined />}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <Button
        type={editorState.isStrikeActive ? 'primary' : 'text'}
        icon={<MdOutlineStrikethroughS />}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <Divider className={dividerStyles} orientation="vertical" />
      <ColorPicker
        value={editorState.textColor}
        onChange={(color) => editor.chain().focus().setColor(color.toHexString()).run()}
      >
        <Button type="text" icon={<MdFormatColorText />} />
      </ColorPicker>
      <Button
        type="text"
        icon={<MdFormatClear />}
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      />
    </>
  )

  return (
    <ConfigProvider componentSize="small">
      {/* 顶部工具栏 */}
      <div className={toolbarStyles}>
        {/* 第一行 */}
        <div className={toolbarRowStyles}>
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

          <Divider className={dividerStyles} orientation="vertical" />

          <Button
            type={editorState.isBoldActive ? 'primary' : 'text'}
            icon={<MdFormatBold />}
            title="加粗"
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <Button
            type={editorState.isItalicActive ? 'primary' : 'text'}
            icon={<MdFormatItalic />}
            title="斜体"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Button
            type={editorState.isUnderlineActive ? 'primary' : 'text'}
            icon={<MdFormatUnderlined />}
            title="下划线"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <Button
            type={editorState.isStrikeActive ? 'primary' : 'text'}
            icon={<MdOutlineStrikethroughS />}
            title="删除线"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />

          <Divider className={dividerStyles} orientation="vertical" />

          <Select
            showSearch={{ filterOption: true }}
            variant="filled"
            value={editorState.fontSize}
            options={FONT_SIZE_OPTIONS}
            style={{ width: 90 }}
            onChange={(value) => {
              editor.chain().focus().setFontSize(value).run()
            }}
          />

          <Select
            variant="filled"
            options={HEADING_OPTIONS}
            value={currentHeading}
            style={{ width: 90 }}
            onChange={handleHeadingClick}
          />

          <Divider className={dividerStyles} orientation="vertical" />

          <Space.Compact>
            <Button
              type={editorState.textAlign === 'left' ? 'primary' : 'text'}
              icon={<MdFormatAlignLeft />}
              title="左对齐"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            />
            <Button
              type={editorState.textAlign === 'center' ? 'primary' : 'text'}
              icon={<MdFormatAlignCenter />}
              title="居中"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            />
            <Button
              type={editorState.textAlign === 'right' ? 'primary' : 'text'}
              icon={<MdFormatAlignRight />}
              title="右对齐"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            />
          </Space.Compact>
        </div>

        {/* 第二行 */}
        <div className={toolbarRowStyles}>
          <Button
            type="text"
            icon={<MdFormatIndentDecrease />}
            title="减少缩进"
            onClick={() => editor.chain().focus().outdent().run()}
          />
          <Button
            type="text"
            icon={<MdFormatIndentIncrease />}
            title="增加缩进"
            onClick={() => editor.chain().focus().indent().run()}
          />

          <Divider className={dividerStyles} orientation="vertical" />

          <Button
            type={editorState.isBulletListActive ? 'primary' : 'text'}
            icon={<MdFormatListBulleted />}
            title="无序列表"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <Button
            type={editorState.isOrderedListActive ? 'primary' : 'text'}
            icon={<MdFormatListNumbered />}
            title="有序列表"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />

          <Divider className={dividerStyles} orientation="vertical" />

          <ColorPicker
            value={editorState.textColor}
            onChange={(color) => {
              editor.chain().focus().setColor(color.toHexString()).run()
            }}
          >
            <Button type="text" icon={<MdFormatColorText />} title="字体颜色" />
          </ColorPicker>

          <ColorPicker
            value={editorState.highlightColor}
            onChange={(color) => {
              editor.chain().focus().toggleHighlight({ color: color.toHexString() }).run()
            }}
          >
            <Button type="text" icon={<MdFormatColorFill />} title="背景颜色" />
          </ColorPicker>

          <Divider className={dividerStyles} orientation="vertical" />

          <Button
            type="text"
            icon={<TbVariablePlus />}
            title="插入变量"
            onClick={() => editor.chain().focus().toggleVariableDrawer('insert').run()}
          />

          <Divider className={dividerStyles} orientation="vertical" />

          <Button
            type="text"
            icon={<MdFormatClear />}
            title="清除格式"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          />

          <Button
            type="text"
            title="插入分页符"
            icon={<ImPageBreak />}
            onClick={() => editor.chain().focus().insertPageBreak().run()}
          />
          <Divider className={dividerStyles} size="small" orientation="vertical" />
          <Button
            type="text"
            icon={isPreview ? <IoMdEyeOff /> : <IoMdEye />}
            title={isPreview ? '编辑' : '预览'}
            onClick={() => setPreview(!isPreview)}
          />
        </div>
      </div>
      {/* 变量节点 */}
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-variable"
        className={bubbleStyles}
        shouldShow={({ editor: ed }) => {
          return ed.isActive('variable')
        }}
      >
        <div className={bubbleRowStyles}>
          {formatButtons}
          <Divider className={dividerStyles} orientation="vertical" />
          <Button
            type="text"
            icon={<MdModeEditOutline />}
            title="替换变量"
            onClick={() => {
              editor.chain().focus().toggleVariableDrawer('replace').run()
            }}
          />
        </div>
      </BubbleMenu>

      {/* 默认文本格式菜单 */}
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu-text"
        className={bubbleStyles}
        shouldShow={({ state, editor: ed }) => {
          const { selection } = state
          // 分页符和变量节点不显示默认菜单
          if (ed.isActive('pageBreak') || ed.isActive('variable')) return false
          const { empty } = selection
          return !empty
        }}
      >
        <div className={bubbleRowStyles}>{formatButtons}</div>
      </BubbleMenu>
    </ConfigProvider>
  )
}
