import Previewer from '@/components/Previewer'

const sampleContent = `
<h1>文书预览示例</h1>
<p>这是一段<strong>加粗文字</strong>和<em>斜体文字</em>的示例。</p>
<h2>列表</h2>
<ul>
  <li>项目一</li>
  <li>项目二</li>
  <li>项目三</li>
</ul>
<blockquote>
  <p>这是一段引用文字。</p>
</blockquote>
<pre><code>console.log('Hello, World!');</code></pre>
`

export default function PreviewPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold text-gray-800 m-0">文书预览</h1>
      </div>
      <div className="flex-1 overflow-auto bg-white">
        <Previewer content={sampleContent} />
      </div>
    </div>
  )
}
