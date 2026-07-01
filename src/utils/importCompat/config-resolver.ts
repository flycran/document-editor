import type { ElementConfig } from './types'

/**
 * 解析 rich_config JSON 字符串，提取 compose_code → ElementConfig 的映射
 * rich_config 结构: { paragraph_map: { "p$static@qianmin": { [compose_code]: ElementConfig } } }
 */
export function parseRichConfig(raw: string): Map<string, ElementConfig> {
  const map = new Map<string, ElementConfig>()

  try {
    const config = JSON.parse(raw)
    const paragraphMap = config?.paragraph_map

    if (!paragraphMap || typeof paragraphMap !== 'object') {
      return map
    }

    // 遍历 paragraph_map 下的所有分组（如 "p$static@qianmin"）
    for (const group of Object.values(paragraphMap)) {
      if (!group || typeof group !== 'object') continue
      // 遍历分组下的所有元素（key 为 compose_code）
      for (const [composeCode, elementConfig] of Object.entries(group as Record<string, unknown>)) {
        if (elementConfig && typeof elementConfig === 'object') {
          map.set(composeCode, elementConfig as ElementConfig)
        }
      }
    }
  } catch {
    // JSON 解析失败，返回空 Map
  }

  return map
}

/**
 * 根据 compose_code 查询配置
 */
export function getConfig(
  configMap: Map<string, ElementConfig>,
  composeCode: string
): ElementConfig | undefined {
  const config = configMap.get(composeCode)
  if (config) {
    return config
  }

  // 直接查找原code
  const strippedCode = composeCode.match(/e\$([\da-zA-Z\.]+)$/)?.[1]

  if (strippedCode) {
    return configMap.get(strippedCode)
  }
}
