import fs from 'node:fs/promises'
import path from 'node:path'
import { DOMParser, Element, XMLSerializer } from '@xmldom/xmldom'
import type { Plugin, ResolvedConfig } from 'vite'

// 将 SVG 文件内容转换为 React 组件
function svgToReactComponent(svgContent: string, componentName: string) {
  const parser = new DOMParser()
  const serializer = new XMLSerializer()

  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml')
  const svgElement = svgDoc.documentElement!

  // 替换颜色
  const replaceColor = (el: Element) => {
    if (el.hasAttribute('fill')) {
      const oldColor = el.getAttribute('fill')
      if (oldColor !== 'white' && oldColor !== 'none') el.setAttribute('fill', 'currentColor')
    }
    if (el.hasAttribute('stroke')) {
      const oldColor = el.getAttribute('stroke')
      if (oldColor !== 'white' && oldColor !== 'none') el.setAttribute('stroke', 'currentColor')
    }
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i]
      if (child.nodeType === 1) {
        replaceColor(child as Element)
      }
    }
  }
  replaceColor(svgElement)

  // 移除 title 标签
  const nodes = svgDoc.getElementsByTagName('title')
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].parentElement?.removeChild(nodes[i])
  }

  // 处理 xlink 命名空间
  const processXlink = (el: Element) => {
    // 移除 xmlns:xlink 属性
    if (el.hasAttribute('xmlns:xlink')) {
      el.removeAttribute('xmlns:xlink')
    }
    // 将 xlink:href 改为 href
    if (el.hasAttribute('xlink:href')) {
      el.removeAttribute('xlink:href')
      const hrefValue = el.getAttribute('xlink:href')
      el.removeAttribute('xlink:href')
      if (hrefValue) {
        el.setAttribute('href', hrefValue)
      }
    }
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i]
      if (child.nodeType === 1) {
        processXlink(child as Element)
      }
    }
  }
  processXlink(svgElement)

  // 属性从短横线改成驼峰
  const renameAttributes = (el: Element) => {
    // 先收集需要修改的属性，避免在遍历中修改集合导致跳过
    const renames: { oldName: string; newName: string; value: string }[] = []
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i]
      const attributeName = attr.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      if (attributeName !== attr.name) {
        renames.push({ oldName: attr.name, newName: attributeName, value: attr.value })
      }
    }
    for (const { oldName, newName, value } of renames) {
      el.removeAttribute(oldName)
      el.setAttribute(newName, value)
    }
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i]
      if (child.nodeType === 1) {
        renameAttributes(child as Element)
      }
    }
  }
  renameAttributes(svgElement)

  const children = Array.from(svgElement.childNodes)

  const serializedChildren = children
    .map((child) => {
      if (child.nodeType === 1) {
        return serializer.serializeToString(child)
      }
      return ''
    })
    .join('')

  const svgAttrs = Array.from(svgElement.attributes).filter(
    (attr) => !['width', 'height', 'class'].includes(attr.name)
  )

  return `import { clsx } from 'clsx'
import { HTMLAttributes } from 'react'

export interface ${componentName}Props extends HTMLAttributes<SVGSVGElement> {}

export default function ${componentName}({ className, ...rest }: ${componentName}Props) {
  return (
    <svg
      {...rest}
      className={clsx('h-[1em] w-[1em]', className)}${svgAttrs
        .map((attr) => `\n      ${attr.name}="${attr.value}"`)
        .join('')}
    >
      ${serializedChildren}
    </svg>
  )
}
`
}

// 扫描目录并处理每个 SVG 文件
async function processSvgFiles(inputDir: string, outputDir: string) {
  await fs.rm(outputDir, { recursive: true, force: true })
  const files = await fs.glob('**/*.svg', { cwd: inputDir })
  let num = 0
  for await (const file of files) {
    try {
      const filePath = path.resolve(inputDir, file)
      const fileName: string = path.basename(file, '.svg')
      const componentName = fileName
        .split(/[-_]/)
        .map((e) => e.charAt(0).toUpperCase() + e.slice(1))
        .join('')
      const svgContent = await fs.readFile(filePath, 'utf8')
      const reactComponentCode = svgToReactComponent(svgContent, componentName)

      const outputFilePath = path.resolve(outputDir, path.dirname(file), `${componentName}.tsx`)
      await fs.mkdir(path.dirname(outputFilePath), { recursive: true })
      await fs.writeFile(outputFilePath, reactComponentCode)
      num++
    } catch (err) {
      console.error(`生成图标组件 ${file} 时出错:`, err)
    }
  }

  return num
}

export interface SvgIconsPluginOptions {
  input?: string
  output?: string
}

/**
 * SVG 图标插件
 * 自动生成图标组件
 * @param {SvgIconsPluginOptions} options
 * @param {string} options.input 输入目录 默认为 icons
 * @param {string} options.output 输出目录 默认为 src/icons/generated
 * @example svgIconsPlugin({ input: 'icons', output: 'src/icons/generated' })
 */
export default function svgIconsPlugin(
  { input = 'icons', output = 'src/icons/generated' }: SvgIconsPluginOptions = {
    input: 'icons',
    output: 'src/icons/generated',
  }
): Plugin {
  let config: ResolvedConfig

  const runCodegen = async (root: string) => {
    const inputDir = path.resolve(root, input)
    const outputDir = path.resolve(root, output)
    const num = await processSvgFiles(inputDir, outputDir)
    console.log(`✅ 已生成 ${num} 个图标组件`)
  }

  return {
    name: 'vite-plugin-svg-icons',
    configResolved(resolved) {
      config = resolved
    },
    buildStart() {
      return runCodegen(config.root)
    },
    configureServer(server) {
      const watchDir = path.resolve(config.root, input)
      server.watcher.add(watchDir)
      const run = async () => {
        await runCodegen(config.root)
      }
      server.watcher.on('all', (_, file) => {
        if (file.startsWith(watchDir)) {
          run()
        }
      })
    },
  }
}
