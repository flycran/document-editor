import { css } from '@emotion/css'

/**
 * Tiptap 编辑器与预览器共享的基础样式
 */
export const tiptapStyles = css`
  .tiptap {
    outline: none;
    padding: 16px;

    h1 {
      font-size: 2em;
      font-weight: bold;
      margin: 0.67em 0;
    }

    h2 {
      font-size: 1.5em;
      font-weight: bold;
      margin: 0.75em 0;
    }

    h3 {
      font-size: 1.17em;
      font-weight: bold;
      margin: 0.83em 0;
    }

    p {
      margin: 0.5em 0;
    }

    ul,
    ol {
      padding-left: 1.5em;
    }

    blockquote {
      border-left: 3px solid #ddd;
      padding-left: 1em;
      margin-left: 0;
      color: #666;
    }

    code {
      background: #f4f4f4;
      border-radius: 4px;
      padding: 0.2em 0.4em;
      font-size: 0.9em;
    }

    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      border-radius: 8px;
      padding: 12px 16px;
      overflow-x: auto;

      code {
        background: none;
        color: inherit;
        padding: 0;
      }
    }

    /* 分页符 */
    .page-break {
      height: 2px;
      background: repeating-linear-gradient(90deg, #999 0px, #999 6px, transparent 6px, transparent 12px);
      margin: 24px 0;
      position: relative;
      cursor: default;
      user-select: none;

      span {
        position: absolute;
        left: 50%;
        top: -10px;
        transform: translateX(-50%);
        background: #fff;
        padding: 0 8px;
        color: #999;
        font-size: 12px;
      }
    }

    @media print {
      .page-break {
        height: 0;
        margin: 0;
        page-break-after: always;
        background: none;

        span {
          display: none;
        }
      }
    }
  }
`

/**
 * 编辑器专用：placeholder 样式
 */
export const editorOnlyStyles = css`
  .tiptap {
    min-height: 300px;

    p.is-editor-empty:first-child::before {
      color: #adb5bd;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
`
