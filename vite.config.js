import { defineConfig, loadEnv } from 'vite'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'

export default defineConfig(({ command, mode }) => {
  // 加载本地环境变量
  const dEnv = loadEnv(mode, process.cwd(), '')
  const enableAnalytics = process.env.VITE_ENABLE_ANALYTICS || dEnv['VITE_ENABLE_ANALYTICS'] || '';
  const clarityProjectId = process.env.VITE_CLARITY_PROJECT_ID || dEnv['VITE_CLARITY_PROJECT_ID'] || '';
  console.log('enableAnalytics------', enableAnalytics)
  console.log('clarityProjectId-----', clarityProjectId)
  
  return {
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: 'index.html'
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // i18n.js 文件也放到 assets 目录并添加指纹
            if (assetInfo.name === 'i18n.js') {
              return 'assets/i18n-[hash].js'
            }
            return 'assets/[name]-[hash][extname]'
          },
          manualChunks: {
            codemirror: ['codemirror', '@codemirror/lang-markdown', '@codemirror/state', '@codemirror/view'],
            markdown: ['marked', 'highlight.js', 'dompurify'],
            export: ['html2canvas', 'jspdf', 'file-saver']
          }
        }
      },
      // 复制静态文件到构建目录
      copyPublicDir: true
    },
    // 指定 public 目录
    publicDir: 'public',
    server: {
      port: 3000,
      open: true
    },
    plugins: [
      {
        name: 'i18n-asset',
        generateBundle(options, bundle) {
          // 将 i18n.js 作为资源文件处理，添加指纹并放到assets目录
          const i18nContent = readFileSync('i18n.js', 'utf-8')
          const hash = createHash('md5').update(i18nContent).digest('hex').slice(0, 8)
          const fileName = `assets/i18n-${hash}.js`
          
          this.emitFile({
            type: 'asset',
            fileName: fileName,
            source: i18nContent
          })
          
          // 创建manifest映射
          if (!bundle['manifest.json']) {
            bundle['manifest.json'] = {
              type: 'asset',
              fileName: 'manifest.json',
              source: JSON.stringify({
                'i18n.js': {
                  file: fileName
                }
              }, null, 2)
            }
          } else {
            // 如果manifest已存在，添加i18n映射
            const manifest = JSON.parse(bundle['manifest.json'].source)
            manifest['i18n.js'] = { file: fileName }
            bundle['manifest.json'].source = JSON.stringify(manifest, null, 2)
          }
        }
      },
      {
        name: 'process-manifest',
        generateBundle(options, bundle) {
          // 查找 manifest 文件
          const manifestKey = Object.keys(bundle).find(key => key.includes('site') && key.endsWith('.webmanifest'))
          if (manifestKey) {
            const manifestFile = bundle[manifestKey]
            if (manifestFile.type === 'asset') {
              let manifestContent = manifestFile.source.toString()
              
              // 查找对应的图标文件并替换路径
              Object.keys(bundle).forEach(key => {
                if (key.includes('favicon-16x16') && key.endsWith('.png')) {
                  manifestContent = manifestContent.replace('./assets/favicon-16x16.png', `./assets/${key.split('/').pop()}`)
                }
                if (key.includes('favicon-32x32') && key.endsWith('.png')) {
                  manifestContent = manifestContent.replace('./assets/favicon-32x32.png', `./assets/${key.split('/').pop()}`)
                }
                if (key.includes('apple-touch-icon') && key.endsWith('.png')) {
                  manifestContent = manifestContent.replace('./assets/apple-touch-icon.png', `./assets/${key.split('/').pop()}`)
                }
              })
              
              manifestFile.source = manifestContent
            }
          }
        }
      },
      {
        name: 'inject-analytics',
        transformIndexHtml: {
          order: 'post',
          handler(html, ctx) {
            // 只在生产构建时注入统计代码
            // 使用兼容函数获取环境变量，优先 Cloudflare，后备本地 .env
            if (ctx.bundle && enableAnalytics) {
              const analyticsScript = `
                <script type="text/javascript">
                    (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                    })(window, document, "clarity", "script", "${clarityProjectId}");
                </script>`
              
              // 在 </head> 标签前插入统计代码
              return html.replace('</head>', `${analyticsScript}\n</head>`)
            }
            console.log(html)
            return html
          }
        }
      }
    ]
  }
})