import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BgColorsOutlined,
  BoldOutlined,
  ClearOutlined,
  FontColorsOutlined,
  ItalicOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { css } from '@emotion/css'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { SelectProps } from 'antd'
import { Button, ColorPicker, Divider, Select, Space, Tooltip } from 'antd'
import { useCallback } from 'react'

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

interface ToolbarProps {
  editor: Editor
}

export default function Toolbar({ editor }: ToolbarProps) {
  // 声明式订阅 editor 状态，仅在这些状态变化时重渲染
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

  return (
    <>
      {/* 顶部工具栏 */}
      <div className={toolbarStyles}>
        {/* 第一行 */}
        <div className={toolbarRowStyles}>
          <Tooltip title="撤销">
            <Button
              type="text"
              icon={<UndoOutlined />}
              disabled={!editorState.canUndo}
              onClick={() => editor.chain().focus().undo().run()}
            />
          </Tooltip>
          <Tooltip title="重做">
            <Button
              type="text"
              icon={<RedoOutlined />}
              disabled={!editorState.canRedo}
              onClick={() => editor.chain().focus().redo().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title="加粗">
            <Button
              type={editorState.isBoldActive ? 'primary' : 'text'}
              icon={<BoldOutlined />}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>
          <Tooltip title="斜体">
            <Button
              type={editorState.isItalicActive ? 'primary' : 'text'}
              icon={<ItalicOutlined />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </Tooltip>
          <Tooltip title="下划线">
            <Button
              type={editorState.isUnderlineActive ? 'primary' : 'text'}
              icon={<UnderlineOutlined />}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
          </Tooltip>
          <Tooltip title="删除线">
            <Button
              type={editorState.isStrikeActive ? 'primary' : 'text'}
              icon={<StrikethroughOutlined />}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" />

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

          <Divider orientation="vertical" />

          <Space.Compact>
            <Tooltip title="左对齐">
              <Button
                type={editorState.textAlign === 'left' ? 'primary' : 'text'}
                icon={<AlignLeftOutlined />}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
              />
            </Tooltip>
            <Tooltip title="居中">
              <Button
                type={editorState.textAlign === 'center' ? 'primary' : 'text'}
                icon={<AlignCenterOutlined />}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
              />
            </Tooltip>
            <Tooltip title="右对齐">
              <Button
                type={editorState.textAlign === 'right' ? 'primary' : 'text'}
                icon={<AlignRightOutlined />}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
              />
            </Tooltip>
          </Space.Compact>
        </div>

        {/* 第二行 */}
        <div className={toolbarRowStyles}>
          <Tooltip title="减少缩进">
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => editor.chain().focus().outdent().run()}
            />
          </Tooltip>
          <Tooltip title="增加缩进">
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              onClick={() => editor.chain().focus().indent().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title="无序列表">
            <Button
              type={editorState.isBulletListActive ? 'primary' : 'text'}
              icon={<UnorderedListOutlined />}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
          </Tooltip>
          <Tooltip title="有序列表">
            <Button
              type={editorState.isOrderedListActive ? 'primary' : 'text'}
              icon={<OrderedListOutlined />}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" />

          <ColorPicker
            value={editorState.textColor}
            onChange={(color) => {
              editor.chain().focus().setColor(color.toHexString()).run()
            }}
          >
            <Tooltip title="字体颜色">
              <Button type="text" icon={<FontColorsOutlined />} />
            </Tooltip>
          </ColorPicker>

          <ColorPicker
            value={editorState.highlightColor}
            onChange={(color) => {
              editor.chain().focus().toggleHighlight({ color: color.toHexString() }).run()
            }}
          >
            <Tooltip title="背景颜色">
              <Button type="text" icon={<BgColorsOutlined />} />
            </Tooltip>
          </ColorPicker>

          <Divider orientation="vertical" />

          <Tooltip title="清除格式">
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            />
          </Tooltip>

          <Tooltip title="插入分页符">
            <Button type="text" onClick={() => editor.chain().focus().insertPageBreak().run()}>
              ⏎
            </Button>
          </Tooltip>

          <Tooltip title="特殊字符">
            <Button type="text" onClick={() => editor.chain().focus().insertContent('§').run()}>
              ¶
            </Button>
          </Tooltip>

          <Tooltip title="Emoji">
            <Button type="text" onClick={() => editor.chain().focus().insertContent('😀').run()}>
              😀
            </Button>
          </Tooltip>
        </div>
      </div>
      {/* Bubble Menu - 选中时弹出格式弹窗 */}
      <BubbleMenu editor={editor} className={bubbleStyles}>
        <div className={bubbleRowStyles}>
          <Button
            type={editorState.isBoldActive ? 'primary' : 'text'}
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <Button
            type={editorState.isItalicActive ? 'primary' : 'text'}
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Button
            type={editorState.isUnderlineActive ? 'primary' : 'text'}
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <Button
            type={editorState.isStrikeActive ? 'primary' : 'text'}
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <Divider orientation="vertical" />
          <ColorPicker
            value={editorState.textColor}
            onChange={(color) => editor.chain().focus().setColor(color.toHexString()).run()}
          >
            <Button type="text" icon={<FontColorsOutlined />} />
          </ColorPicker>
          <Button
            type="text"
            icon={<ClearOutlined />}
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
          />
        </div>
      </BubbleMenu>
    </>
  )
}
