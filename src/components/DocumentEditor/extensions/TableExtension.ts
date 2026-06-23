import { Extension } from '@tiptap/core'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'

/**
 * 表格扩展
 * 配置 Tiptap 的表格功能，支持列宽拖拽调整
 */
export const TableExtension = Extension.create({
  name: 'tableExtension',

  addExtensions() {
    return [
      Table.configure({
        resizable: true, // 支持列宽拖拽调整
      }),
      TableRow,
      TableHeader,
      TableCell,
    ]
  },
})
