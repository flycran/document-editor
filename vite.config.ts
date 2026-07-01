import react from '@vitejs/plugin-react-swc'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgIconsPlugin from './plugins/vite-plugin-svg-icons'
import project from './src/config/project'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'
  const isWc = mode === 'wc'
  const isAdapter = mode === 'adapter'
  const isDemo = mode === 'demo'

  return {
    base: isDemo ? `/${project.name}/` : undefined,
    publicDir: isWc || isAdapter ? false : undefined,
    server: {
      port: project.port,
      proxy: {
        '/api': {
          target: project.origin.chagineProxy,
          changeOrigin: true,
        },
      },
    },
    worker: {
      format: 'es',
    },
    plugins: [
      ...(isLib || isWc || isAdapter
        ? []
        : [codeInspectorPlugin({ bundler: 'vite' }), svgIconsPlugin(), devtoolsJson()]),

      tsconfigPaths(),
      react(),
      AutoImport({
        imports: ['react', { clsx: ['clsx'], dayjs: [['default', 'dayjs']] }],
        dts: './src/types/auto-imports.d.ts',
      }),
    ],
    build: isLib
      ? {
          lib: {
            entry: 'src/index.ts',
            formats: ['es', 'cjs'],
          },
          outDir: 'dist/component',
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react/jsx-runtime',
              'antd',
              '@ant-design/icons',
              '@tiptap/core',
              '@tiptap/pm',
              '@tiptap/react',
              '@tiptap/starter-kit',
              '@tiptap/extension-color',
              '@tiptap/extension-font-size',
              '@tiptap/extension-highlight',
              '@tiptap/extension-placeholder',
              '@tiptap/extension-table',
              '@tiptap/extension-table-cell',
              '@tiptap/extension-table-header',
              '@tiptap/extension-table-row',
              '@tiptap/extension-text-align',
              '@tiptap/extension-text-style',
              '@tiptap/extension-underline',
              'dayjs',
              'clsx',
              'jotai',
              'react-icons',
            ],
          },
        }
      : isWc
        ? {
            lib: {
              entry: 'src/wc.ts',
              formats: ['es', 'cjs'],
            },
            outDir: 'dist/web-component',
            rollupOptions: {
              external: [],
            },
          }
        : isAdapter
          ? {
              lib: {
                entry: 'src/adapter.ts',
                formats: ['es', 'cjs'],
              },
              outDir: 'dist/adapter',
              rollupOptions: {
                external: ['react', 'react-dom', 'react/jsx-runtime'],
              },
            }
          : undefined,
  }
})
