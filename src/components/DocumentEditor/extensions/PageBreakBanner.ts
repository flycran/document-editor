import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreakBanner: {}
  }

  interface Storage {
    view: { dom: HTMLElement } | null
  }
}

/**
 * 插件状态类型
 */
interface PluginState {
  /** 装饰集 */
  decorationSet: DecorationSet
  /** 页边距状态 */
  marginState: PageMarginState
  /** widget DOM 引用 */
  widgetElement: HTMLDivElement
}

export interface PageBreakBannerOptions {
  /**
   * Banner 根元素的 CSS 类名
   * @default 'tiptap-header-banner'
   */
  class?: string
  /**
   * A4 纸张高度（毫米）
   * @default 297
   */
  pageHeightMm?: number
  /**
   * 上边距（页头高度，毫米）
   * @default 20
   */
  topMarginMm?: number
  /**
   * 下边距（页脚高度，毫米）
   * @default 20
   */
  bottomMarginMm?: number
  /**
   * 间隔高度（页间分割线，毫米）
   * @default 10
   */
  gapHeightMm?: number
}

/**
 * 页边距状态
 */
interface PageMarginState {
  /** 当前页数 */
  pageCount: number
}

/**
 * 分页横幅扩展 - 轻量级分页实现
 *
 * 在 ProseMirror 可编辑区域（.ProseMirror）顶部插入一个不可编辑的 div 元素，
 * 用于实现分页效果。
 *
 * ## 分页原理
 * 1. 通过设置 page 的 margin-top 定位到第一页的末尾位置
 * 2. breaker 元素将自动分割位于该位置的节点，将占用 breaker 空间的节点往下挤
 * 3. 由于无需在文档中插入元素，且每一页的高度是固定的
 * 4. 只需要根据内容的总高度来计算需要分多少页
 *
 * ## 计算逻辑
 * 使用"上一次"的值打破循环依赖：
 * 1. 获取可编辑区域高度
 * 2. 减去上一次计算的所有页边距，得到内容净高度
 * 3. 计算新页数
 * 4. 更新DOM和页边距总和
 *
 * ## 页边距计算公式
 * ```
 * 页边距总和 = p * (上边距 + 下边距) - (p - 1) * 间隔高度
 * ```
 *
 * ## 实现原理
 * 使用 ProseMirror 的 Decoration.widget 在文档 position 0 处插入一个
 * contenteditable="false" 的 DOM 元素。
 *
 * ## 为什么用 Decoration.widget 而不是直接操作 DOM
 * - 直接插入的 DOM 会在 ProseMirror 下一次重渲染时被移除
 * - 作为 Node 加入 schema 会污染文档模型（出现在 getJSON() 中）
 * - Decoration.widget 是 ProseMirror 官方支持的"虚拟 DOM"机制：
 *   - 不属于文档模型，不会出现在 getJSON() / getHTML() 中
 *   - ProseMirror 自动管理其生命周期（创建/更新/销毁）
 *   - 不会干扰光标定位和内容编辑
 *
 * ## 防干扰措施
 * - contenteditable="false"：浏览器层面禁止编辑
 * - ignoreMutation: () => true：忽略 banner 内部的 DOM 变更，防止 ProseMirror 误判
 * - side: -1：widget 始终位于 position 0 之前，确保在文档最顶部
 * - key: 'page-break-banner'：帮助 ProseMirror 在 diff 时复用 DOM，避免不必要的重建
 */
export const PageBreakBanner = Extension.create<PageBreakBannerOptions>({
  name: 'pageBreakBanner',

  addOptions() {
    return {
      pageHeightMm: 297,
      topMarginMm: 20,
      bottomMarginMm: 20,
    }
  },

  onCreate() {
    // 存储编辑器引用，用于后续访问 view
    this.storage.view = null as { dom: HTMLElement } | null
  },

  onUpdate() {
    // 更新存储的 view 引用
    if (this.editor) {
      this.storage.view = this.editor.view
    }
  },

  addProseMirrorPlugins() {
    const options = this.options
    /**
     * 毫米转像素（假设 96dpi，1mm ≈ 3.7795px）
     * @param mm - 毫米值
     * @returns 像素值
     */
    const mmToPx = (mm: number) => Math.round(mm * 3.7795)

    const pageHeight = mmToPx(options.pageHeightMm!)
    const topMargin = mmToPx(options.topMarginMm!)
    const bottomMargin = mmToPx(options.bottomMarginMm!)
    const gapHeight = mmToPx(10!)

    /**
     * 计算页边距总和
     * 公式：页边距总和 = p * (上边距 + 下边距) - (p - 1) * 间隔高度
     * @param pageCount - 页数
     * @returns 页边距总和（像素）
     */
    const calculateTotalMarginHeight = (pageCount: number) => {
      return pageCount * (topMargin + bottomMargin) - (pageCount - 1) * gapHeight
    }

    /**
     * 计算页数
     * @param contentHeight - 内容净高度（像素）
     * @returns 页数
     */
    const calculatePageCount = (contentHeight: number) => {
      const availableHeight = pageHeight - topMargin - bottomMargin
      return Math.max(1, Math.ceil(contentHeight / availableHeight))
    }

    /**
     * 创建单个分页元素
     * @param index - 分页元素的索引（从0开始）
     * @param totalBreaks - 分页元素的总数
     * @returns 分页元素的HTMLElement
     */
    const createPageBreak = (index: number, totalBreaks: number): HTMLElement => {
      const pageBreak = document.createElement('div')
      pageBreak.className = 'tiptap-page-break'

      // page 元素（用于定位分页位置）
      const page = document.createElement('div')
      page.className = 'page'
      // 通过 margin-top 定位到对应的页
      page.style.marginTop = `${index === 0 ? 0 : index * pageHeight - bottomMargin}px`
      pageBreak.appendChild(page)

      // breaker 元素
      const breaker = document.createElement('div')
      breaker.className = 'breaker'
      pageBreak.appendChild(breaker)

      // 第一个：只有页头
      if (index === 0) {
        const header = document.createElement('div')
        header.className = 'tiptap-page-header'
        header.style.height = `${topMargin}px`
        breaker.appendChild(header)
      }
      // 最后一个：只有页脚
      else if (index === totalBreaks - 1) {
        const footer = document.createElement('div')
        footer.className = 'tiptap-page-footer'
        footer.style.height = `${bottomMargin}px`
        breaker.appendChild(footer)
      }
      // 中间：页脚 + 间隔 + 页头
      else {
        // 页脚
        const footer = document.createElement('div')
        footer.className = 'tiptap-page-footer'
        footer.style.height = `${bottomMargin}px`
        breaker.appendChild(footer)

        // 间隔
        const gap = document.createElement('div')
        gap.className = 'tiptap-pagination-gap'
        gap.style.height = `${gapHeight}px`
        breaker.appendChild(gap)

        // 页头
        const header = document.createElement('div')
        header.className = 'tiptap-page-header'
        header.style.height = `${topMargin}px`
        breaker.appendChild(header)
      }

      return pageBreak
    }

    const editor = this.editor

    const plugin: Plugin<PluginState> = new Plugin({
      key: new PluginKey('pageBreakBanner'),
      state: {
        init(_, state) {
          // 初始状态：1页
          const initialState: PageMarginState = {
            pageCount: 1,
          }

          const widgetElement = document.createElement('div')
          widgetElement.className = options.class || 'tiptap-header-banner'
          widgetElement.setAttribute('contenteditable', 'false')

          // 创建第一页的分页元素（2个：header和footer）
          const pageBreak1 = createPageBreak(0, 2)
          const pageBreak2 = createPageBreak(1, 2)
          widgetElement.appendChild(pageBreak1)
          widgetElement.appendChild(pageBreak2)

          const widget = Decoration.widget(0, () => widgetElement, {
            side: -1,
            ignoreMutation: () => true,
            key: 'page-break-banner',
          })

          return {
            decorationSet: DecorationSet.create(state.doc, [widget]),
            marginState: initialState,
            widgetElement,
          }
        },
        apply(tr, oldState) {
          // 如果文档内容没有变化，直接返回旧状态
          if (!tr.docChanged) return oldState
          const viewEl = editor.view.dom

          if (!viewEl) return oldState

          const oldMarginState = oldState.marginState

          const viewRect = viewEl.getBoundingClientRect()
          const lastRect = viewEl.children[viewEl.children.length - 1].getBoundingClientRect()
          // 容器最后一个元素距离容器底部的距离
          const bottomMargin = viewRect.bottom - lastRect.bottom
          // 获取容器高度
          const containerHeight = viewEl.clientHeight

          const totalMarginHeight = calculateTotalMarginHeight(oldMarginState.pageCount)

          // 计算内容净高度
          const contentHeight = containerHeight - bottomMargin - totalMarginHeight

          // 计算新页数
          const newPageCount = calculatePageCount(contentHeight)

          // 如果页数没有变化，直接返回旧状态
          if (newPageCount === oldMarginState.pageCount) return oldState

          // 创建新的状态
          const newMarginState: PageMarginState = {
            pageCount: newPageCount,
          }

          // 更新 widget DOM
          if (oldState.widgetElement) {
            // 清空现有内容
            oldState.widgetElement.innerHTML = ''

            // 创建新的分页元素
            // 页数 = tiptap-page-break数量 - 1
            const totalBreaks = newPageCount + 1
            for (let i = 0; i < totalBreaks; i++) {
              const pageBreak = createPageBreak(i, totalBreaks)
              oldState.widgetElement.appendChild(pageBreak)
            }
          }

          return {
            decorationSet: oldState.decorationSet.map(tr.mapping, tr.doc),
            marginState: newMarginState,
            widgetElement: oldState.widgetElement,
          }
        },
      },
      props: {
        decorations(state) {
          return plugin.getState(state)?.decorationSet
        },
      },
    })

    return [plugin]
  },
})
