# document-editor

基于 Tiptap + React 19 的文书编辑器组件库，提供富文本编辑、变量插入、文档预览等能力，同时支持原生 Web Component 方式在非 React 项目中使用。

## 特性

- 🚀 **开箱即用** — 提供完整的 React 组件和原生 Web Component
- ✍️ **富文本编辑** — 基于 Tiptap，支持标题、加粗、斜体、下划线、删除线、列表、对齐、缩进、字体大小、文字颜色、高亮等
- 📊 **表格支持** — 插入表格、行列增删、合并单元格
- 🔢 **变量系统** — 在文档中插入变量节点，支持多种数据类型（文本、数字、日期、时间、布尔、下拉选择）
- 🖨️ **打印预览** — 内置打印和 HTML 导出功能
- 🎨 **自定义扩展** — 分页符、签名节点、首行缩进等自定义节点
- 🌐 **跨框架使用** — 通过 Web Component 在 Vue、Angular、原生 HTML 等非 React 项目中使用

---

## 安装

```bash
bun add document-editor
# 或
npm install document-editor
```

> **React 组件模式**：宿主项目需自行安装 `react` ^19.2 和 `react-dom` ^19.2。
>
> **Web Component 模式**：本包自带完整的react 19运行时。

---

## 使用

### React 组件

#### 编辑器（DocumentEditor）

编辑器是核心组件，提供完整的富文本编辑体验，包含工具栏、变量抽屉、签名支持和引导教程。

```tsx
import { DocumentEditor, EditorRef } from 'document-editor'
import 'document-editor/document-editor.css'

function App() {
  const editorRef = useRef<EditorRef>(null)

  return (
    <DocumentEditor
      ref={editorRef}
      placeholder="开始输入..."
      content={initialContent}
      inputable
      onSave={({ editor }) => {
        console.log('保存内容:', editor.getJSON())
      }}
      onUpdate={({ editor }) => {
        console.log('内容更新:', editor.getJSON())
      }}
      variableListProps={{
        templateList: [],        // 模板列表数据
        templateListLoading: false,
        variableList: [],        // 变量列表数据
        variableListLoading: false,
        onTemplateSelect: (id) => {
          // 选中模板后的回调
        },
      }}
      getEnumsQuery={(params) => {
        // 返回枚举列表，用于下拉选择型变量
        return [{ value: '1', label: '选项1' }]
      }}
      // 签名相关
      doctorSginImage="data:image/png;base64,..."
      patientSginImage="data:image/png;base64,..."
      onDoctorSgin={() => console.log('医生签名')}
      onPatientSgin={() => console.log('患者签名')}
    />
  )
}
```

#### 预览器（DocumentPreviewer）

预览器用于只读模式展示文档内容，支持变量表单输入和打印导出。

```tsx
import { DocumentPreviewer, PreviewerRef } from 'document-editor'

function Preview() {
  const previewRef = useRef<PreviewerRef>(null)

  return (
    <DocumentPreviewer
      ref={previewRef}
      content={docContent}       // JSONContent 格式的文档内容
      formData={{ field1: '值' }} // 预填充的表单数据
      inputable                   // 是否允许在预览中填写变量
      getEnumsQuery={(params) => []}
    />
  )
}
```

#### 变量列表（VariableList）

变量列表组件可独立使用，展示模板和变量树，支持搜索和点击插入/替换变量。

```tsx
import { VariableList } from 'document-editor'

<VariableList
  templateList={templates}
  templateListLoading={loading}
  templateValue={selectedId}
  variableList={variables}
  variableListLoading={false}
  onTemplateSelect={(medicalId) => fetchVariables(medicalId)}
  mode="insert"  // 'insert' | 'replace'
/>
```

---

### 原生组件（Web Component）

当项目不使用 React 19 时（如 Vue、Angular、Svelte 或原生 HTML），可以通过 Web Component 方式使用文档预览器。

#### 1. 导入并注册

```ts
// 导入即自动注册 <document-previewer> 自定义元素
import 'document-editor/wc'
import 'document-editor/wc/document-editor.css'
```

#### 2. 在 React 中使用（JSX）

```tsx
import type { HTMLPreviewerElement } from 'document-editor/wc'

function App() {
  const ref = useRef<HTMLPreviewerElement>(null)

  return (
    <div>
      <document-previewer
        ref={ref}
        content={initialContent}
        inputable
      />
      <button onClick={() => console.log(ref.current?.getPreviewHTML?.())}>
        输出 HTML
      </button>
      <button onClick={() => ref.current?.print?.()}>
        打印
      </button>
    </div>
  )
}
```

---

## 通用 API

### EditorRef（编辑器引用）

| 属性/方法 | 类型 | 说明 |
|---|---|---|
| `editor` | `Editor` | Tiptap Editor 实例，可直接调用所有 Tiptap API |
| `print()` | `() => Promise<void>` | 触发打印 |
| `form` | `FormInstance` | antd Form 实例，用于获取变量表单值 |
| `getPreviewHTML()` | `() => string` | 获取预览用 HTML 字符串 |

### PreviewerRef（预览器引用）

| 属性/方法 | 类型 | 说明 |
|---|---|---|
| `editor` | `Editor` | Tiptap Editor 实例 |
| `print()` | `() => void` | 触发打印 |
| `form` | `FormInstance` | antd Form 实例 |
| `getPreviewHTML()` | `() => string` | 获取预览用 HTML 字符串 |

### DocumentEditor Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `placeholder` | `string` | `'开始输入...'` | 编辑器占位文本 |
| `content` | `JSONContent` | — | 编辑器初始内容（Tiptap JSON 格式） |
| `inputable` | `boolean` | — | 是否允许在编辑器中输入变量值 |
| `onSave` | `({ editor }) => void` | — | 保存回调 |
| `onUpdate` | `({ editor }) => void` | — | 内容更新回调 |
| `onFocus` | `({ editor }) => void` | — | 聚焦回调 |
| `onBlur` | `({ editor }) => void` | — | 失焦回调 |
| `variableListProps` | `Omit<VariableListProps, 'mode'>` | **必填** | 变量列表配置 |
| `getEnumsQuery` | `(params) => EnumsItem[]` | — | 枚举查询函数，用于下拉变量 |
| `doctorSginImage` | `string` | — | 医生签名图片（Base64） |
| `patientSginImage` | `string` | — | 患者签名图片（Base64） |
| `familySginImage` | `string` | — | 家属签名图片（Base64） |
| `onDoctorSgin` | `() => void` | — | 医生签名点击回调 |
| `onPatientSgin` | `() => void` | — | 患者签名点击回调 |
| `onFamilySgin` | `() => void` | — | 家属签名点击回调 |

### DocumentPreviewer Props

| 属性 | 类型 | 说明 |
|---|---|---|
| `content` | `JSONContent` | 预览的文档内容 |
| `formData` | `any` | 预填充的表单数据 |
| `inputable` | `boolean` | 是否允许在预览中填写变量 |
| `getEnumsQuery` | `(params) => EnumsItem[]` | 枚举查询函数 |

### VariableList Props

| 属性 | 类型 | 说明 |
|---|---|---|
| `templateList` | `Array` | 模板列表数据 |
| `templateListLoading` | `boolean` | 模板列表加载状态 |
| `templateValue` | `string` | 当前选中的模板 ID |
| `variableList` | `InformedTemplateParagraphListItem[]` | 变量/段落列表 |
| `variableListLoading` | `boolean` | 变量列表加载状态 |
| `onTemplateSelect` | `(medicalId: string) => void` | 模板选中回调 |

---

## 编辑器使用技巧

### 变量系统

编辑器支持在文档中插入**变量节点**，变量分为以下类型：

| 类型 | 说明 | 渲染形式 |
|---|---|---|
| `text` | 文本输入 | `<Input />` |
| `number` | 数字输入 | `<Input type="number" />` |
| `date` | 日期选择 | `<DatePicker />` |
| `time` | 时间选择 | `<TimePicker />` |
| `date-time` | 日期时间选择 | `<DatePicker showTime />` |
| `boolean` | 布尔选择 | 单选按钮组 |
| `select` | 下拉选择（有值域） | `<Select />`（通过 `getEnumsQuery` 获取选项） |

#### 插入变量

1. 点击工具栏 **「插入变量」** 按钮打开变量抽屉
2. 选择模板 → 展开节点 → 点击变量元素即可插入
3. 支持搜索过滤变量

#### 替换变量

1. 选中已有的变量节点
2. 在弹出的气泡菜单中点击 **「替换变量」**
3. 在抽屉中选择新变量即可替换

#### 变量别名

选中变量后，可在气泡菜单中点击 **「设置别名」** 为该变量设置显示别名，别名会替代原始标签显示。

#### 显示/隐藏字段名

变量节点默认显示字段名标签，可通过气泡菜单中的 **「显示字段名」** 按钮切换。

### 签名节点

工具栏提供三种签名类型按钮：医生签名、患者签名、家属签名。点击即可在光标处插入签名占位符。签名节点也支持别名设置和字段名显示切换。

### 分页符

点击工具栏 **「分页符」** 按钮可在光标处插入分页符，打印时会在分页符处换页。

### 表格操作

- **插入表格**：点击工具栏表格按钮，拖拽选择行列数（1×1 ~ 8×8）
- **选中表格后**，气泡菜单提供：上方/下方添加行、左侧/右侧添加列、删除行/列、删除表格
- 支持合并单元格（通过 Tiptap 原生表格命令）

### 导入/导出

工具栏提供导入和导出按钮，支持将编辑器内容导出为 JSON 文件，或从 JSON 文件导入内容。

### 快捷键

| 快捷键 | 功能 |
|---|---|
| `Ctrl+B` | 加粗 |
| `Ctrl+I` | 斜体 |
| `Ctrl+U` | 下划线 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Shift+Z` / `Ctrl+Y` | 重做 |

### 获取编辑器内容

```tsx
const ref = useRef<EditorRef>(null)

// 获取 JSON 格式内容（用于存储）
const json = ref.current?.editor.getJSON()

// 获取 HTML 格式内容
const html = ref.current?.editor.getHTML()

// 获取预览用 HTML（含样式）
const previewHtml = ref.current?.getPreviewHTML()

// 获取表单数据（变量值）
const formValues = ref.current?.form.getFieldsValue()

// 打印
await ref.current?.print()
```

---

## 在不支持 React 19 的项目中使用原生组件

如果你的项目使用 Vue、Angular、Svelte、jQuery 或原生 HTML，无法直接使用 React 组件，可以通过 Web Component 方式集成。

### 原理

项目使用 `@r2wc/react-to-web-component` 将 React 组件包装为标准的 Custom Element。`<document-previewer>` 是一个注册在全局的自定义元素，可以在任何框架中使用。

### 完整示例

参考 `examples/wc-demo/` 目录，其中包含一个完整的使用示例。

### 属性传递

Web Component 的属性通过 HTML attribute 或 JavaScript property 传递：

```js
const el = document.querySelector('document-previewer')

// JSON 类型属性
el.content = { type: 'doc', content: [...] }
el.formData = { field1: 'value' }

// 布尔类型属性
el.inputable = true

// 函数类型属性
el.getEnumsQuery = (params) => [{ value: '1', label: '选项' }]

// 字符串类型属性
el.className = 'my-previewer'
```

### 调用方法

```js
const el = document.querySelector('document-previewer')

// 获取预览 HTML
const html = el.getPreviewHTML()

// 打印
el.print()

// 获取表单值
const values = el.form.getFieldsValue()

// 访问 Tiptap Editor 实例
const json = el.editor.getJSON()
```

### 注意事项

1. **样式隔离**：Web Component 使用 Light DOM 模式，样式需要手动引入 CSS 文件
2. **React 依赖**：即使使用 Web Component，宿主项目仍需安装 `react` 和 `react-dom` 作为 peer dependency
3. **JSON 属性**：`content` 和 `formData` 为 JSON 类型，需通过 JS property 设置，不能通过 HTML attribute 传递

---

## 开发

```bash
# 如果使用 mise 则执行这一步
mise install
# 如果不使用 mise 则执行这两步
nvm use 24
npm install bun@1 -g

bun install
bun dev
```

#### 访问地址

```
http://localhost:4004/editor?account=900101&tenant_id=900101&password=240408
```

### 构建

```bash
# 构建 React 组件库
bun run build

# 构建 Web Component
bun run build:wc

# 构建 Demo
bun run build:demo
```

### API 文件自动生成

```bash
# 单次生成
bun run codegen

# 监听模式（文件变更自动重新生成）
bun run codegen:watch
```

API 代码生成配置位于 `scripts/codegen-api/`，基于 OpenAPI 规范文件 `openapi/openapi.json` 自动生成 TypeScript 类型和请求函数。

### 项目结构

```
src/
├── components/
│   ├── DocumentEditor/       # 编辑器组件
│   │   ├── contexts/         # Context（编辑器实例、枚举、签名事件）
│   │   ├── extensions/       # Tiptap 自定义扩展
│   │   │   ├── VariableExtension.ts   # 变量抽屉状态管理
│   │   │   ├── VariableNode/          # 变量节点
│   │   │   ├── SginNode/              # 签名节点
│   │   │   ├── PageBreakNode.ts       # 分页符节点
│   │   │   ├── TextIndentNode.ts      # 首行缩进
│   │   │   └── TableExtension.ts      # 表格扩展
│   │   ├── Toolbar/          # 工具栏
│   │   └── EditorTour/       # 新手引导
│   ├── DocumentPreviewer/    # 预览器组件
│   ├── VariableList/         # 变量列表组件
│   └── PreviewField/         # 预览字段组件
├── wc.ts                     # Web Component 入口
├── index.ts                  # React 组件入口
└── utils/                    # 工具函数（打印、HTML 导出）
```

## 其他

! 禁止修改generated目录下的文件，这些文件由插件生成，任何修改都会被覆盖。
