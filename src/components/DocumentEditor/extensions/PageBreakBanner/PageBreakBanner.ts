import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view'
import './PageBreakBanner.scss'

/**
 * setPageMargin 命令入参（毫米，省略的字段保持不变）
 */
export interface PageMarginInput {
  /** 上边距 */
  top?: number
  /** 下边距 */
  bottom?: number
  /** 页间间隔 */
  gap?: number
  /** 纸张高度 */
  pageHeight?: number
}

/**
 * 页边距状态（毫米）
 */
interface PageMargins {
  /** 纸张高度 */
  pageHeightMm: number
  /** 上边距 */
  topMarginMm: number
  /** 下边距 */
  bottomMarginMm: number
  /** 页间间隔 */
  gapHeightMm: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreakBanner: {
      setPageMargin: (margins: PageMarginInput) => ReturnType
    }
  }

  interface Storage {
    view: { dom: HTMLElement } | null
  }
}

/** setPageMargin 触发页数重算时携带的 meta key */
const PAGE_MARGIN_META = 'pageMarginChanged'

/**
 * 插件状态类型
 */
interface PluginState {
  /** 装饰集 */
  decorationSet: DecorationSet
  /** 当前页边距（毫米） */
  margins: PageMargins
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
 * 把页边距（毫米）写入编辑器容器（.tiptap）的 CSS 变量
 * @param dom - 编辑器容器 DOM
 * @param margins - 页边距（省略的字段保持不变）
 */
const writeMarginsToDom = (dom: HTMLElement, margins: Partial<PageMargins>) => {
  if (margins.pageHeightMm != null)
    dom.style.setProperty('--page-height', `${margins.pageHeightMm}mm`)
  if (margins.topMarginMm != null)
    dom.style.setProperty('--page-top-margin', `${margins.topMarginMm}mm`)
  if (margins.bottomMarginMm != null)
    dom.style.setProperty('--page-bottom-margin', `${margins.bottomMarginMm}mm`)
  if (margins.gapHeightMm != null) dom.style.setProperty('--page-gap', `${margins.gapHeightMm}mm`)
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
 * ## 页边距传递
 * 页边距等尺寸通过 CSS 变量（--page-height / --page-top-margin / --page-bottom-margin /
 * --page-gap）设置在编辑器容器（.tiptap）上，CSS 用 var()/calc() 驱动 header/footer/gap
 * 高度与 page 定位。改变边距时（setPageMargin 命令）只需更新变量值，浏览器自动重排，
 * 不重建分页 DOM；仅当页数因此变化时才重建 tiptap-page-break 元素。
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
      gapHeightMm: 10,
    }
  },

  onCreate() {
    // 存储编辑器引用，用于后续访问 view
    this.storage.view = null as { dom: HTMLElement } | null
    // 把初始页边距写入编辑器容器的 CSS 变量，作为渲染的真实来源
    if (this.editor?.view?.dom) {
      writeMarginsToDom(this.editor.view.dom, this.options)
    }
  },

  onUpdate() {
    // 更新存储的 view 引用
    if (this.editor) {
      this.storage.view = this.editor.view
    }
  },

  addCommands() {
    return {
      /**
       * 设置页边距（毫米）。更新编辑器容器的 CSS 变量，视觉即时变化；
       * 同时触发一次页数重算，仅在页数变化时才重建分页元素。
       */
      setPageMargin:
        (margins: PageMarginInput) =>
        ({ editor }) => {
          const dom = editor.view.dom
          writeMarginsToDom(dom, {
            pageHeightMm: margins.pageHeight,
            topMarginMm: margins.top,
            bottomMarginMm: margins.bottom,
            gapHeightMm: margins.gap,
          })
          // CSS 变量已同步生效，dispatch meta 触发页数重算（变量已更新，测量用新值）
          editor.view.dispatch(editor.state.tr.setMeta(PAGE_MARGIN_META, margins))
          return true
        },
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

    /**
     * 计算页边距总和
     * 公式：页边距总和 = p * (上边距 + 下边距) - (p - 1) * 间隔高度
     * @param pageCount - 页数
     * @param margins - 当前页边距
     * @returns 页边距总和（像素）
     */
    const calculateTotalMarginHeight = (pageCount: number, margins: PageMargins) => {
      const topMargin = mmToPx(margins.topMarginMm)
      const bottomMargin = mmToPx(margins.bottomMarginMm)
      const gapHeight = mmToPx(margins.gapHeightMm)
      return pageCount * (topMargin + bottomMargin) - (pageCount - 1) * gapHeight
    }

    /**
     * 计算页数
     * @param contentHeight - 内容净高度（像素）
     * @param margins - 当前页边距
     * @returns 页数
     */
    const calculatePageCount = (contentHeight: number, margins: PageMargins) => {
      const pageHeight = mmToPx(margins.pageHeightMm)
      const topMargin = mmToPx(margins.topMarginMm)
      const bottomMargin = mmToPx(margins.bottomMarginMm)
      const availableHeight = pageHeight - topMargin - bottomMargin
      return Math.max(1, Math.ceil(contentHeight / availableHeight))
    }

    /**
     * 创建单个分页元素
     *
     * 尺寸全部由 CSS 变量驱动，这里只负责结构与页码索引（--page-index），
     * 边距变化时无需重建本元素。
     * @param index - 分页元素的索引（从0开始）
     * @param totalBreaks - 分页元素的总数
     * @returns 分页元素的HTMLElement
     */
    const createPageBreak = (index: number, totalBreaks: number): HTMLElement => {
      const pageBreak = document.createElement('div')
      pageBreak.className = 'tiptap-page-break'

      // page 元素（用于定位分页位置）：通过 --page-index 由 CSS calc 定位到对应的页
      const page = document.createElement('div')
      page.className = 'page'
      page.style.setProperty('--page-index', String(index))
      pageBreak.appendChild(page)

      // breaker 元素
      const breaker = document.createElement('div')
      breaker.className = 'breaker'
      pageBreak.appendChild(breaker)

      // 第一个：只有页头
      if (index === 0) {
        const header = document.createElement('div')
        header.className = 'tiptap-page-header'
        breaker.appendChild(header)
      }
      // 最后一个：只有页脚
      else if (index === totalBreaks - 1) {
        const footer = document.createElement('div')
        footer.className = 'tiptap-page-footer'
        breaker.appendChild(footer)
      }
      // 中间：页脚 + 间隔 + 页头
      else {
        // 页脚
        const footer = document.createElement('div')
        footer.className = 'tiptap-page-footer'
        breaker.appendChild(footer)

        // 间隔
        const gap = document.createElement('div')
        gap.className = 'tiptap-pagination-gap'
        breaker.appendChild(gap)

        // 页头
        const header = document.createElement('div')
        header.className = 'tiptap-page-header'
        breaker.appendChild(header)
      }

      return pageBreak
    }

    // 当前页数（视图层派生状态，不进 ProseMirror state）
    // 初始 1 页，与 init 中创建的 2 个 page-break（单页）对应
    let lastPageCount = 1

    /**
     * 测量容器并按需重建 widget 分页元素
     * 在 view.update 中调用——此时 ProseMirror 已将最新文档渲染到 DOM，测量无滞后。
     * 仅当页数变化时重建，避免 view.update → dispatch meta → view.update 的循环
     * （meta 事务触发的二次 update 页数不变，直接 return 终止）。
     */
    const recountPages = (view: EditorView) => {
      const state = plugin.getState(view.state)
      if (!state) return

      const { margins, widgetElement } = state
      const viewEl = view.dom

      const viewRect = viewEl.getBoundingClientRect()
      const lastRect = viewEl.children[viewEl.children.length - 1].getBoundingClientRect()
      // 容器最后一个元素（用户输入的最后一行）距离容器底部的距离
      const bottomMargin = viewRect.bottom - lastRect.bottom
      // 获取容器高度
      const containerHeight = viewEl.clientHeight

      const totalMarginHeight = calculateTotalMarginHeight(lastPageCount, margins)

      // 计算内容净高度
      const contentHeight = containerHeight - bottomMargin - totalMarginHeight

      // 计算新页数
      const newPageCount = calculatePageCount(contentHeight, margins)

      // 页数未变 → 不重建（循环终止点）
      if (newPageCount === lastPageCount) return

      // 页数变化 → 重建 widget 分页元素
      // 页数 = tiptap-page-break 数量 - 1
      const totalBreaks = newPageCount + 1
      widgetElement.innerHTML = ''
      for (let i = 0; i < totalBreaks; i++) {
        widgetElement.appendChild(createPageBreak(i, totalBreaks))
      }
      lastPageCount = newPageCount
    }

    const plugin: Plugin<PluginState> = new Plugin({
      key: new PluginKey('pageBreakBanner'),
      state: {
        init(_, state) {
          const initialMargins: PageMargins = {
            pageHeightMm: options.pageHeightMm!,
            topMarginMm: options.topMarginMm!,
            bottomMarginMm: options.bottomMarginMm!,
            gapHeightMm: options.gapHeightMm!,
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
            margins: initialMargins,
            widgetElement,
          }
        },
        apply(tr, oldState) {
          // 仅边距变化（setPageMargin）时需要合并新边距到状态；
          // 页数测量与 widget DOM 重建由 view.update 负责（apply 在 DOM 渲染前执行，测量会滞后）。
          const marginInput = tr.getMeta(PAGE_MARGIN_META) as PageMarginInput | undefined
          if (!marginInput) return oldState

          const margins: PageMargins = {
            pageHeightMm: marginInput.pageHeight ?? oldState.margins.pageHeightMm,
            topMarginMm: marginInput.top ?? oldState.margins.topMarginMm,
            bottomMarginMm: marginInput.bottom ?? oldState.margins.bottomMarginMm,
            gapHeightMm: marginInput.gap ?? oldState.margins.gapHeightMm,
          }

          return {
            decorationSet: oldState.decorationSet.map(tr.mapping, tr.doc),
            margins,
            widgetElement: oldState.widgetElement,
          }
        },
      },
      props: {
        decorations(state) {
          return plugin.getState(state)?.decorationSet
        },
      },
      // spec.view（与 state/props 同级）：ProseMirror 完成 DOM 渲染后触发 update，
      // 此时测量无滞后，输入溢出即时分页。文档变化与边距变化（setPageMargin 的 meta
      // 事务）统一走此路径。
      view: () => ({
        update: (view) => recountPages(view),
      }),
    })

    return [plugin]
  },
})
