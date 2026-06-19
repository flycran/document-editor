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
      list-style: revert;
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

    .variable-node {
      display: inline-block;
      padding: 0 6px;
      margin: 0 2px;
      color: #1677ff;
      cursor: default;
      height: 1.375em;
      line-height: 1.375em;

      &.ProseMirror-selectednode {
        outline: 2px solid #1677ff60;
        background: #1677ff60;
        border-radius: 3px;
      }

      ::before {
        content: "{{";
        font-weight: 500;
        margin-right: 0.25em;
      }

      ::after {
        content: "}}";
        font-weight: 500;
        margin-left: 0.25em;
      }

      .variable-node-label {
        outline: 1px solid rgb(228, 120, 44);
        color: rgb(228, 120, 44);
        padding: 0 4px;
        border-radius: 2px;
      }
      .variable-node-separator {
        margin: 0 0.25em;
      }
      .variable-node-code {
        outline: 1px solid rgb(0, 143, 145);
        color: rgb(0, 143, 145);
        padding: 0 4px;
        border-radius: 2px;
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
