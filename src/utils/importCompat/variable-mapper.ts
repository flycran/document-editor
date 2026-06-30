import { SGIN_ENUMS } from '@/components/DocumentEditor/extensions/SginNode/SginUtils'
import type { ElementConfig, TiptapNode } from './types'

/**
 * 根据 ElementConfig 的 is_* 字段判断 variable 节点的 type 属性
 * 参考 VariableList.tsx 中的映射逻辑：
 *   has_range → 'select'
 *   is_bool === 1 → 'boolean'
 *   is_number === 1 → 'number'
 *   is_date === 1 → 'date'
 *   is_time === 1 → 'time'
 *   is_date_time === 1 → 'date-time'
 *   其他 → 'text'
 */
export function resolveVariableType(config: ElementConfig): string {
  if (config.has_range) return 'select'
  if (config.is_bool === 1) return 'boolean'
  if (config.is_number === 1) return 'number'
  if (config.is_date === 1) return 'date'
  if (config.is_time === 1) return 'time'
  if (config.is_date_time === 1) return 'date-time'
  return 'text'
}

/**
 * 计算 labelAlias：alias_name 与 label 一致时留空，不一致时写入 alias_name
 */
function resolveLabelAlias(aliasName: string, label: string): string {
  return aliasName && aliasName !== label ? aliasName : ''
}

/**
 * 从 ElementConfig 构建 variable 节点的 attrs
 * label 始终来自 config.name，alias_name 不一致时写入 labelAlias
 */
export function buildVariableAttrs(config: ElementConfig): Record<string, unknown> {
  const name = config.name || ''
  const aliasName = config.alias_name || config.ui?.data_name?.alias_name || ''

  return {
    label: name,
    code: config.code || '',
    type: resolveVariableType(config),
    showLabel: true,
    labelAlias: resolveLabelAlias(aliasName, name),
  }
}

/** 签名 code 前缀 → sgin 节点 type 映射 */
const SGIN_CODE_MAP: Record<string, string> = {
  'QM.YS': 'doctor',
  'QM.HZ': 'patient',
  'QM.JS': 'family',
}

/**
 * 构建 sgin 签名节点的 attrs
 * sgin 节点只存 type/showLabel/labelAlias，label 由前端实时计算
 */
function buildSginAttrs(config: ElementConfig, sginType: string): Record<string, unknown> {
  const label = SGIN_ENUMS[sginType as keyof typeof SGIN_ENUMS] || config.name || ''
  const aliasName = config.alias_name || config.ui?.data_name?.alias_name || ''
  return {
    type: sginType,
    showLabel: true,
    labelAlias: resolveLabelAlias(aliasName, label),
  }
}

/**
 * 创建 variable 或 sgin Tiptap 节点
 * 签名节点（code 以 QM.YS/QM.HZ/QM.JS 开头）→ sgin 节点
 * 其余 → variable 节点
 */
export function createVariableNode(config: ElementConfig): TiptapNode {
  const code = config.code || ''
  for (const [prefix, sginType] of Object.entries(SGIN_CODE_MAP)) {
    if (code.startsWith(prefix)) {
      return {
        type: 'sgin',
        attrs: buildSginAttrs(config, sginType),
      }
    }
  }
  return {
    type: 'variable',
    attrs: buildVariableAttrs(config),
  }
}
