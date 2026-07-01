/**
 * importCompat 模块类型定义
 */

/** 旧格式输入 */
export interface OldFormatInput {
  rich_text: string
  rich_config: string
}

/** rich_config 中 paragraph_map 下单个元素的配置 */
export interface ElementConfig {
  id: string
  code: string
  name: string
  value_type: string
  required?: boolean
  has_range: boolean
  is_char: number
  is_number: number
  is_date: number
  is_time: number
  is_date_time: number
  is_bool: number
  is_data: number
}
