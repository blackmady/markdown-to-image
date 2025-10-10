import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { saveAs } from 'file-saver'

class MarkdownEditor {
    constructor() {
        this.editor = null
        this.isDarkMode = false
        this.isFullscreen = false
        this.isTocVisible = false
        this.syncScroll = true
        this.wordWrap = true
        this.currentFile = null
        
        this.init()
    }

    init() {
        this.setupEditor()
        this.setupEventListeners()
        this.setupMarked()
        this.loadTheme()
        this.updatePreview()
    }

    setupEditor() {
        const editorElement = document.getElementById('editor')
        
        const extensions = [
            basicSetup,
            markdown(),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.updatePreview()
                    this.updateToc()
                }
            }),
            EditorView.theme({
                '&': {
                    height: '100%',
                    fontSize: '14px'
                },
                '.cm-content': {
                    padding: '16px',
                    minHeight: '100%'
                },
                '.cm-focused': {
                    outline: 'none'
                },
                '.cm-editor': {
                    height: '100%'
                },
                '.cm-scroller': {
                    fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
                }
            })
        ]

        this.editor = new EditorView({
            state: EditorState.create({
                doc: this.getDefaultContent(),
                extensions
            }),
            parent: editorElement
        })

        // 设置滚动同步
        this.setupScrollSync()
    }

    setupScrollSync() {
        const editorScroller = this.editor.scrollDOM
        const previewElement = document.getElementById('preview')
        
        let isEditorScrolling = false
        let isPreviewScrolling = false

        editorScroller.addEventListener('scroll', () => {
            if (!this.syncScroll || isPreviewScrolling) return
            
            isEditorScrolling = true
            const scrollRatio = editorScroller.scrollTop / (editorScroller.scrollHeight - editorScroller.clientHeight)
            const previewScrollTop = scrollRatio * (previewElement.scrollHeight - previewElement.clientHeight)
            previewElement.parentElement.scrollTop = previewScrollTop
            
            setTimeout(() => { isEditorScrolling = false }, 100)
        })

        previewElement.parentElement.addEventListener('scroll', () => {
            if (!this.syncScroll || isEditorScrolling) return
            
            isPreviewScrolling = true
            const previewWrapper = previewElement.parentElement
            const scrollRatio = previewWrapper.scrollTop / (previewWrapper.scrollHeight - previewWrapper.clientHeight)
            const editorScrollTop = scrollRatio * (editorScroller.scrollHeight - editorScroller.clientHeight)
            editorScroller.scrollTop = editorScrollTop
            
            setTimeout(() => { isPreviewScrolling = false }, 100)
        })
    }

    setupEventListeners() {
        // 工具栏按钮
        document.getElementById('toggleToc').addEventListener('click', () => this.toggleToc())
        document.getElementById('toggleFullscreen').addEventListener('click', () => this.toggleFullscreen())
        document.getElementById('toggleTheme').addEventListener('click', () => this.toggleTheme())
        document.getElementById('newFile').addEventListener('click', () => this.newFile())
        document.getElementById('openFile').addEventListener('click', () => this.openFile())
        document.getElementById('saveFile').addEventListener('click', () => this.saveFile())
        document.getElementById('closeToc').addEventListener('click', () => this.toggleToc())
        
        // 面板按钮
        document.getElementById('syncScroll').addEventListener('click', () => this.toggleSyncScroll())
        document.getElementById('wordWrap').addEventListener('click', () => this.toggleWordWrap())
        
        // 导出功能
        this.setupExportMenu()
        
        // 文件输入
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileLoad(e))
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e))
    }

    setupExportMenu() {
        const exportBtn = document.getElementById('exportBtn')
        const exportDropdown = exportBtn.parentElement
        const exportMenu = exportDropdown.querySelector('.export-menu')
        
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            exportDropdown.classList.toggle('active')
        })
        
        document.addEventListener('click', () => {
            exportDropdown.classList.remove('active')
        })
        
        exportMenu.addEventListener('click', (e) => {
            e.stopPropagation()
            const format = e.target.dataset.format
            if (format) {
                this.exportFile(format)
                exportDropdown.classList.remove('active')
            }
        })
    }

    setupMarked() {
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value
                    } catch (err) {}
                }
                return hljs.highlightAuto(code).value
            },
            breaks: true,
            gfm: true
        })
    }

    getDefaultContent() {
        return `# Markdown 转换工具

欢迎使用这个功能强大的 Markdown 编辑器！

## 功能特性

- ✨ **实时预览** - 左侧编辑，右侧实时预览
- 🌙 **夜间模式** - 支持明暗主题切换
- 📋 **目录导航** - 自动生成文档目录
- 🖥️ **全屏编辑** - 专注写作模式
- 📤 **多格式导出** - 支持 HTML、PDF、PNG、JPG、WEBP
- 📱 **响应式设计** - 完美适配各种设备

## 使用方法

### 基本操作

1. 在左侧编辑器中输入 Markdown 内容
2. 右侧会实时显示渲染结果
3. 使用工具栏按钮进行各种操作

### 快捷键

- \`Ctrl/Cmd + S\` - 保存文件
- \`Ctrl/Cmd + O\` - 打开文件
- \`Ctrl/Cmd + N\` - 新建文件
- \`F11\` - 切换全屏模式
- \`Ctrl/Cmd + D\` - 切换夜间模式

### 代码高亮

支持多种编程语言的语法高亮：

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

### 表格支持

| 功能 | 状态 | 描述 |
|------|------|------|
| 编辑器 | ✅ | CodeMirror 6 |
| 预览 | ✅ | Marked + highlight.js |
| 导出 | ✅ | 多格式支持 |

### 数学公式

支持 LaTeX 数学公式（需要额外配置）：

行内公式：$E = mc^2$

块级公式：
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 开始使用

现在就开始编辑这个文档，或者创建一个新文档吧！`
    }

    updatePreview() {
        const content = this.editor.state.doc.toString()
        const html = marked(content)
        const sanitizedHtml = DOMPurify.sanitize(html)
        document.getElementById('preview').innerHTML = sanitizedHtml
    }

    updateToc() {
        const content = this.editor.state.doc.toString()
        const tocContent = document.getElementById('tocContent')
        
        // 提取标题
        const headings = []
        const lines = content.split('\n')
        
        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\\s+(.+)$/)
            if (match) {
                const level = match[1].length
                const text = match[2].trim()
                const id = text.toLowerCase().replace(/[^\\w\\s-]/g, '').replace(/\\s+/g, '-')
                headings.push({ level, text, id, line: index })
            }
        })
        
        if (headings.length === 0) {
            tocContent.innerHTML = '<p class="toc-empty">暂无目录</p>'
            return
        }
        
        const tocHtml = headings.map(heading => 
            `<a href="#${heading.id}" class="toc-item level-${heading.level}" data-line="${heading.line}">
                ${heading.text}
            </a>`
        ).join('')
        
        tocContent.innerHTML = tocHtml
        
        // 添加点击事件
        tocContent.querySelectorAll('.toc-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault()
                const targetId = item.getAttribute('href').substring(1)
                const targetElement = document.getElementById(targetId) || 
                                   document.querySelector(`[id="${targetId}"]`) ||
                                   document.querySelector(`h1, h2, h3, h4, h5, h6`)
                
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' })
                }
            })
        })
    }

    toggleToc() {
        this.isTocVisible = !this.isTocVisible
        const tocSidebar = document.getElementById('tocSidebar')
        tocSidebar.classList.toggle('active', this.isTocVisible)
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen
        document.body.classList.toggle('fullscreen-mode', this.isFullscreen)
        
        // 更新按钮图标
        const btn = document.getElementById('toggleFullscreen')
        const svg = btn.querySelector('svg path')
        if (this.isFullscreen) {
            svg.setAttribute('d', 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z')
        } else {
            svg.setAttribute('d', 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z')
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode
        this.applyTheme()
        localStorage.setItem('darkMode', this.isDarkMode)
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('darkMode')
        if (savedTheme !== null) {
            this.isDarkMode = savedTheme === 'true'
        } else {
            this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        this.applyTheme()
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
        
        // 更新 highlight.js 主题
        const lightTheme = document.getElementById('hljs-light')
        const darkTheme = document.getElementById('hljs-dark')
        
        if (this.isDarkMode) {
            lightTheme.disabled = true
            darkTheme.disabled = false
        } else {
            lightTheme.disabled = false
            darkTheme.disabled = true
        }
        
        // 更新编辑器主题
        this.updateEditorTheme()
    }

    updateEditorTheme() {
        const currentDoc = this.editor.state.doc
        const extensions = [
            basicSetup,
            markdown(),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    this.updatePreview()
                    this.updateToc()
                }
            }),
            EditorView.theme({
                '&': {
                    height: '100%',
                    fontSize: '14px'
                },
                '.cm-content': {
                    padding: '16px',
                    minHeight: '100%'
                },
                '.cm-focused': {
                    outline: 'none'
                },
                '.cm-editor': {
                    height: '100%'
                },
                '.cm-scroller': {
                    fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
                }
            })
        ]
        
        if (this.isDarkMode) {
            extensions.push(oneDark)
        }
        
        this.editor.setState(EditorState.create({
            doc: currentDoc,
            extensions
        }))
        
        this.setupScrollSync()
    }

    toggleSyncScroll() {
        this.syncScroll = !this.syncScroll
        const btn = document.getElementById('syncScroll')
        btn.classList.toggle('active', this.syncScroll)
    }

    toggleWordWrap() {
        this.wordWrap = !this.wordWrap
        const btn = document.getElementById('wordWrap')
        btn.classList.toggle('active', this.wordWrap)
        // TODO: 实现自动换行功能
    }

    newFile() {
        if (confirm('确定要创建新文件吗？未保存的更改将丢失。')) {
            this.editor.dispatch({
                changes: {
                    from: 0,
                    to: this.editor.state.doc.length,
                    insert: this.getDefaultContent()
                }
            })
            this.currentFile = null
            this.updatePreview()
            this.updateToc()
        }
    }

    openFile() {
        document.getElementById('fileInput').click()
    }

    handleFileLoad(event) {
        const file = event.target.files[0]
        if (!file) return
        
        const reader = new FileReader()
        reader.onload = (e) => {
            this.editor.dispatch({
                changes: {
                    from: 0,
                    to: this.editor.state.doc.length,
                    insert: e.target.result
                }
            })
            this.currentFile = file.name
            this.updatePreview()
            this.updateToc()
        }
        reader.readAsText(file)
    }

    saveFile() {
        const content = this.editor.state.doc.toString()
        const filename = this.currentFile || 'document.md'
        const blob = new Blob([content], { type: 'text/markdown' })
        saveAs(blob, filename)
    }

    async exportFile(format) {
        const content = this.editor.state.doc.toString()
        const previewElement = document.getElementById('preview')
        
        try {
            switch (format) {
                case 'html':
                    await this.exportHTML(content)
                    break
                case 'pdf':
                    await this.exportPDF(previewElement)
                    break
                case 'png':
                    await this.exportImage(previewElement, 'png')
                    break
                case 'jpg':
                    await this.exportImage(previewElement, 'jpeg')
                    break
                case 'webp':
                    await this.exportImage(previewElement, 'webp')
                    break
            }
        } catch (error) {
            console.error('导出失败:', error)
            alert('导出失败，请重试')
        }
    }

    async exportHTML(content) {
        const html = marked(content)
        const sanitizedHtml = DOMPurify.sanitize(html)
        
        const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        ${this.getMarkdownCSS()}
    </style>
</head>
<body>
    <div class="markdown-body">
        ${sanitizedHtml}
    </div>
</body>
</html>`
        
        const blob = new Blob([fullHtml], { type: 'text/html' })
        saveAs(blob, 'document.html')
    }

    async exportPDF(element) {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        })
        
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        const imgWidth = 210
        const pageHeight = 295
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        let heightLeft = imgHeight
        
        let position = 0
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
        }
        
        pdf.save('document.pdf')
    }

    async exportImage(element, format) {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        })
        
        canvas.toBlob((blob) => {
            const extension = format === 'jpeg' ? 'jpg' : format
            saveAs(blob, `document.${extension}`)
        }, `image/${format}`, 0.9)
    }

    getMarkdownCSS() {
        return `
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        .markdown-body h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
        .markdown-body h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
        .markdown-body h3 { font-size: 1.25em; }
        .markdown-body p { margin-bottom: 16px; }
        .markdown-body blockquote { padding: 0 16px; margin: 0 0 16px 0; color: #6a737d; border-left: 4px solid #dfe2e5; }
        .markdown-body code { padding: 2px 4px; font-size: 85%; background-color: rgba(27,31,35,0.05); border-radius: 3px; }
        .markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background-color: #f6f8fa; border-radius: 6px; }
        .markdown-body table { border-spacing: 0; border-collapse: collapse; margin-bottom: 16px; }
        .markdown-body table th, .markdown-body table td { padding: 6px 13px; border: 1px solid #dfe2e5; }
        .markdown-body table th { font-weight: 600; background-color: #f6f8fa; }
        `
    }

    handleKeyboard(event) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey
        
        if (ctrlKey && event.key === 's') {
            event.preventDefault()
            this.saveFile()
        } else if (ctrlKey && event.key === 'o') {
            event.preventDefault()
            this.openFile()
        } else if (ctrlKey && event.key === 'n') {
            event.preventDefault()
            this.newFile()
        } else if (event.key === 'F11') {
            event.preventDefault()
            this.toggleFullscreen()
        } else if (ctrlKey && event.key === 'd') {
            event.preventDefault()
            this.toggleTheme()
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownEditor()
})