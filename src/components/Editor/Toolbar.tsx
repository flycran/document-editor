import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BgColorsOutlined,
  BoldOutlined,
  ClearOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
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
import type { MenuProps } from 'antd'
import { Button, ColorPicker, Divider, Dropdown, Tooltip } from 'antd'
import { useCallback } from 'react'

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px']

const HEADING_ITEMS: MenuProps['items'] = [
  { key: 'paragraph', label: '正文' },
  { key: 'heading1', label: '标题 1' },
  { key: 'heading2', label: '标题 2' },
  { key: 'heading3', label: '标题 3' },
]

const bubbleStyles = css`
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 4px;
`

interface ToolbarProps {
  editor: Editor
}

export default function Toolbar({ editor }: ToolbarProps) {
  // 声明式订阅 editor 状态，仅在这些状态变化时重渲染
  const storedMarks = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.state.storedMarks,
  })
  const isBoldActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive('bold'),
  })
  const isItalicActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive('italic'),
  })
  const isUnderlineActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive('underline'),
  })
  const isStrikeActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive('strike'),
  })
  const isBulletListActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive('bulletList'),
  })
  const isOrderedListActive = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.isActive('orderedList'),
  })
  const textAlign = useEditorState({
    editor,
    selector: (ctx) => {
      if (ctx.editor.isActive({ textAlign: 'center' })) return 'center'
      if (ctx.editor.isActive({ textAlign: 'right' })) return 'right'
      return 'left'
    },
  })
  const headingLevel = useEditorState({
    editor,
    selector: (ctx) => {
      if (ctx.editor.isActive('heading', { level: 1 })) return 1
      if (ctx.editor.isActive('heading', { level: 2 })) return 2
      if (ctx.editor.isActive('heading', { level: 3 })) return 3
      return 0
    },
  })
  const fontSize = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.getAttributes('textStyle').fontSize || '16px',
  })
  const textColor = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.getAttributes('textStyle').color || '#000000',
  })
  const highlightColor = useEditorState({
    editor,
    selector: (ctx) => ctx.editor.getAttributes('highlight').color || '#ffff00',
  })

  // 合并 storedMarks：有选区时看 isActive，无选区时看 storedMarks
  const isMarkActive = (name: string) => {
    const activeMap: Record<string, boolean> = {
      bold: isBoldActive,
      italic: isItalicActive,
      underline: isUnderlineActive,
      strike: isStrikeActive,
    }
    if (activeMap[name]) return true
    if (!storedMarks) return false
    return storedMarks.some((m) => m.type.name === name)
  }

  const currentHeading =
    headingLevel === 1
      ? '标题 1'
      : headingLevel === 2
        ? '标题 2'
        : headingLevel === 3
          ? '标题 3'
          : '正文'

  const fontSizeItems: MenuProps['items'] = FONT_SIZES.map((size) => ({
    key: size,
    label: size,
    onClick: () => {
      editor.chain().focus().setFontSize(size).run()
    },
  }))

  const handleHeadingClick: MenuProps['onClick'] = useCallback(
    ({ key }) => {
      switch (key) {
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
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
        {/* 第一行 */}
        <div className="flex items-center gap-1 w-full">
          <Tooltip title="撤销">
            <Button
              type="text"
              size="small"
              icon={<UndoOutlined />}
              onClick={() => editor.chain().focus().undo().run()}
            />
          </Tooltip>
          <Tooltip title="重做">
            <Button
              type="text"
              size="small"
              icon={<RedoOutlined />}
              onClick={() => editor.chain().focus().redo().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title="加粗">
            <Button
              type={isBoldActive ? 'primary' : 'text'}
              size="small"
              icon={<BoldOutlined />}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
          </Tooltip>
          <Tooltip title="斜体">
            <Button
              type={isMarkActive('italic') ? 'primary' : 'text'}
              size="small"
              icon={<ItalicOutlined />}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </Tooltip>
          <Tooltip title="下划线">
            <Button
              type={isMarkActive('underline') ? 'primary' : 'text'}
              size="small"
              icon={<UnderlineOutlined />}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
          </Tooltip>
          <Tooltip title="删除线">
            <Button
              type={isMarkActive('strike') ? 'primary' : 'text'}
              size="small"
              icon={<StrikethroughOutlined />}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" />

          <Dropdown
            menu={{
              items: fontSizeItems,
              selectable: true,
              selectedKeys: [fontSize],
            }}
          >
            <Button type="text" size="small" icon={<FontSizeOutlined />}>
              {fontSize}
            </Button>
          </Dropdown>

          <Dropdown
            menu={{
              items: HEADING_ITEMS,
              onClick: handleHeadingClick,
            }}
          >
            <Button type="text" size="small">
              {currentHeading}
            </Button>
          </Dropdown>

          <Divider orientation="vertical" />

          <Tooltip title="左对齐">
            <Button
              type={textAlign === 'left' ? 'primary' : 'text'}
              size="small"
              icon={<AlignLeftOutlined />}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            />
          </Tooltip>
          <Tooltip title="居中">
            <Button
              type={textAlign === 'center' ? 'primary' : 'text'}
              size="small"
              icon={<AlignCenterOutlined />}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            />
          </Tooltip>
          <Tooltip title="右对齐">
            <Button
              type={textAlign === 'right' ? 'primary' : 'text'}
              size="small"
              icon={<AlignRightOutlined />}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            />
          </Tooltip>
        </div>

        {/* 第二行 */}
        <div className="flex items-center gap-1 w-full">
          <Tooltip title="减少缩进">
            <Button
              type="text"
              size="small"
              icon={<MenuUnfoldOutlined />}
              onClick={() => editor.chain().focus().outdent().run()}
            />
          </Tooltip>
          <Tooltip title="增加缩进">
            <Button
              type="text"
              size="small"
              icon={<MenuFoldOutlined />}
              onClick={() => editor.chain().focus().indent().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip title="无序列表">
            <Button
              type={isBulletListActive ? 'primary' : 'text'}
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
          </Tooltip>
          <Tooltip title="有序列表">
            <Button
              type={isOrderedListActive ? 'primary' : 'text'}
              size="small"
              icon={<OrderedListOutlined />}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </Tooltip>

          <Divider orientation="vertical" />

          <ColorPicker
            value={textColor}
            onChange={(color) => {
              editor.chain().focus().setColor(color.toHexString()).run()
            }}
            size="small"
          >
            <Tooltip title="字体颜色">
              <Button type="text" size="small" icon={<FontColorsOutlined />} />
            </Tooltip>
          </ColorPicker>

          <ColorPicker
            value={highlightColor}
            onChange={(color) => {
              editor.chain().focus().toggleHighlight({ color: color.toHexString() }).run()
            }}
            size="small"
          >
            <Tooltip title="背景颜色">
              <Button type="text" size="small" icon={<BgColorsOutlined />} />
            </Tooltip>
          </ColorPicker>

          <Divider orientation="vertical" />

          <Tooltip title="清除格式">
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            />
          </Tooltip>

          <Tooltip title="插入分页符">
            <Button
              type="text"
              size="small"
              onClick={() => editor.chain().focus().insertPageBreak().run()}
            >
              ⏎
            </Button>
          </Tooltip>

          <Tooltip title="特殊字符">
            <Button
              type="text"
              size="small"
              onClick={() => editor.chain().focus().insertContent('§').run()}
            >
              ¶
            </Button>
          </Tooltip>

          <Tooltip title="Emoji">
            <Button
              type="text"
              size="small"
              onClick={() => editor.chain().focus().insertContent('😀').run()}
            >
              😀
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Bubble Menu - 选中时弹出格式弹窗 */}
      <BubbleMenu editor={editor} className={bubbleStyles}>
        <div className="flex items-center gap-1">
          <Button
            type={isMarkActive('bold') ? 'primary' : 'text'}
            size="small"
            icon={<BoldOutlined />}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <Button
            type={isMarkActive('italic') ? 'primary' : 'text'}
            size="small"
            icon={<ItalicOutlined />}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <Button
            type={isMarkActive('underline') ? 'primary' : 'text'}
            size="small"
            icon={<UnderlineOutlined />}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <Button
            type={isMarkActive('strike') ? 'primary' : 'text'}
            size="small"
            icon={<StrikethroughOutlined />}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <Divider orientation="vertical" />
          <ColorPicker
            value={textColor}
            onChange={(color) => editor.chain().focus().setColor(color.toHexString()).run()}
            size="small"
          >
            <Button type="text" size="small" icon={<FontColorsOutlined />} />
          </ColorPicker>
          <Button
            type="text"
            size="small"
            icon={<ClearOutlined />}
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
          />
        </div>
      </BubbleMenu>
    </>
  )
}
