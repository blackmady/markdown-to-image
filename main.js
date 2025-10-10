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

    // 生成有效的CSS ID
    generateValidId(text, index) {
        // 移除所有非字母数字字符，只保留字母、数字、空格和连字符
        let id = text.toLowerCase()
            .replace(/[^\w\s-]/g, '') // 移除特殊字符
            .replace(/\s+/g, '-')     // 空格替换为连字符
            .replace(/-+/g, '-')      // 多个连字符合并为一个
            .replace(/^-|-$/g, '')    // 移除开头和结尾的连字符
        
        // 确保ID不为空且以字母开头（CSS规范要求）
        if (!id || !/^[a-zA-Z]/.test(id)) {
            id = `heading-${index}`
        }
        
        // 确保ID至少有一个字符
        if (id.length === 0) {
            id = `heading-${index}`
        }
        
        return id
    }

    setupTocClickHandler() {
        const tocContent = document.getElementById('tocContent')
        
        // 移除旧的事件监听器（如果存在）
        if (this.tocClickHandler) {
            tocContent.removeEventListener('click', this.tocClickHandler)
        }
        
        // 创建新的事件处理器
        this.tocClickHandler = (e) => {
            const tocItem = e.target.closest('.toc-item')
            if (tocItem) {
                e.preventDefault()
                
                console.log('TOC click event triggered', tocItem)
                console.log('Processing toc-item click:', tocItem)
                console.log('TOC item HTML:', tocItem.outerHTML)
                
                const href = tocItem.getAttribute('href')
                const dataLine = tocItem.getAttribute('data-line')
                const headingIndex = tocItem.getAttribute('data-heading-index')
                
                console.log('href:', href, 'data-line:', dataLine, 'heading-index:', headingIndex)
                
                if (href) {
                    const targetId = href.substring(1) // 移除 # 号
                    
                    // 验证targetId是否为有效的CSS选择器
                    if (!targetId || targetId.trim() === '' || targetId === '-') {
                        console.error('Invalid target ID:', targetId)
                        return
                    }
                    
                    console.log('Looking for target element with ID:', targetId)
                    
                    // 滚动预览区域
                    const previewElement = document.getElementById('preview')
                    let targetElement = null
                    
                    // 安全地查询元素，使用try-catch防止无效选择器
                    try {
                        targetElement = previewElement.querySelector(`#${CSS.escape(targetId)}`)
                    } catch (error) {
                        console.error('Invalid CSS selector for ID:', targetId, error)
                        return
                    }
                    
                    if (targetElement) {
                        console.log('Target element found, scrolling to it')
                        targetElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        })
                        
                        // 同步滚动编辑器
                        if (dataLine) {
                            try {
                                const lineNumber = parseInt(dataLine)
                                console.log('Syncing editor to line:', lineNumber + 1)
                                
                                if (lineNumber >= 0 && lineNumber < this.editor.state.doc.lines) {
                                    const pos = this.editor.state.doc.line(Math.max(1, lineNumber + 1)).from
                                    this.editor.dispatch({
                                        selection: { anchor: pos, head: pos },
                                        scrollIntoView: true
                                    })
                                    this.editor.focus()
                                } else {
                                    console.warn('Line number out of bounds:', lineNumber)
                                }
                            } catch (error) {
                                console.error('Error syncing editor scroll:', error)
                            }
                        }
                    } else {
                        console.log('Exact match failed, searching all headings...')
                        const allHeadings = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
                        console.log('All headings in preview:')
                        allHeadings.forEach((h, i) => {
                            console.log(`  ${i}: id="${h.id}", text="${h.textContent.trim()}"`)
                        })
                        
                        // 尝试根据标题索引匹配
                        if (headingIndex !== null) {
                            const index = parseInt(headingIndex)
                            if (index >= 0 && index < allHeadings.length) {
                                const targetByIndex = allHeadings[index]
                                console.log('Found target by index:', targetByIndex)
                                targetByIndex.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'start' 
                                })
                                
                                // 同步滚动编辑器
                                if (dataLine) {
                                    try {
                                        const lineNumber = parseInt(dataLine)
                                        console.log('Syncing editor to line:', lineNumber + 1)
                                        
                                        if (lineNumber >= 0 && lineNumber < this.editor.state.doc.lines) {
                                            const pos = this.editor.state.doc.line(Math.max(1, lineNumber + 1)).from
                                            this.editor.dispatch({
                                                selection: { anchor: pos, head: pos },
                                                scrollIntoView: true
                                            })
                                            this.editor.focus()
                                        }
                                    } catch (error) {
                                        console.error('Error syncing editor scroll:', error)
                                    }
                                }
                                return
                            }
                        }
                        
                        console.error('Target element not found:', targetId)
                        console.log('Available elements in preview:', previewElement.innerHTML.substring(0, 500) + '...')
                    }
                }
            }
        }
        
        // 绑定新的事件监听器
        tocContent.addEventListener('click', this.tocClickHandler)
    }

    init() {
        this.setupEditor()
        this.setupEventListeners()
        this.setupMarked()
        this.loadTheme()
        this.updatePreview()
        this.updateToc()
        this.setupTocClickHandler() // 确保在初始化时设置目录点击处理器
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
        // 清除之前的事件监听器
        if (this.editorScrollHandler) {
            this.editor.scrollDOM.removeEventListener('scroll', this.editorScrollHandler)
        }
        if (this.previewScrollHandler) {
            const previewWrapper = document.querySelector('.preview-wrapper')
            if (previewWrapper) {
                previewWrapper.removeEventListener('scroll', this.previewScrollHandler)
            }
        }

        const editorScroller = this.editor.scrollDOM
        const previewWrapper = document.querySelector('.preview-wrapper')
        
        if (!editorScroller || !previewWrapper) return
        
        let isEditorScrolling = false
        let isPreviewScrolling = false

        // 编辑器滚动同步到预览
        this.editorScrollHandler = () => {
            if (!this.syncScroll || isPreviewScrolling) return
            
            isEditorScrolling = true
            const scrollRatio = editorScroller.scrollTop / Math.max(1, editorScroller.scrollHeight - editorScroller.clientHeight)
            const previewScrollTop = scrollRatio * Math.max(0, previewWrapper.scrollHeight - previewWrapper.clientHeight)
            previewWrapper.scrollTop = previewScrollTop
            
            setTimeout(() => { isEditorScrolling = false }, 100)
        }

        // 预览滚动同步到编辑器
        this.previewScrollHandler = () => {
            if (!this.syncScroll || isEditorScrolling) return
            
            isPreviewScrolling = true
            const scrollRatio = previewWrapper.scrollTop / Math.max(1, previewWrapper.scrollHeight - previewWrapper.clientHeight)
            const editorScrollTop = scrollRatio * Math.max(0, editorScroller.scrollHeight - editorScroller.clientHeight)
            editorScroller.scrollTop = editorScrollTop
            
            setTimeout(() => { isPreviewScrolling = false }, 100)
        }

        editorScroller.addEventListener('scroll', this.editorScrollHandler)
        previewWrapper.addEventListener('scroll', this.previewScrollHandler)
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
        
        // 为标题添加ID以支持锚点跳转
        const previewElement = document.getElementById('preview')
        previewElement.innerHTML = sanitizedHtml
        
        // 为所有标题添加ID
        const headings = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
        headings.forEach((heading, index) => {
            const text = heading.textContent.trim()
            const id = this.generateValidId(text, index)
            heading.id = id
        })
    }

    updateToc() {
        const content = this.editor.state.doc.toString()
        const tocContent = document.getElementById('tocContent')
        const tocSidebar = document.getElementById('tocSidebar')
        
        // 提取标题
        const headings = []
        const lines = content.split('\n')
        
        lines.forEach((line, index) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/)
            if (match) {
                const level = match[1].length
                const text = match[2].trim()
                headings.push({ level, text, line: index })
            }
        })
        
        if (headings.length === 0) {
            tocContent.innerHTML = '<p class="toc-empty">暂无目录</p>'
            // 如果没有标题，隐藏目录
            this.isTocVisible = false
            tocSidebar.classList.remove('active')
            return
        }
        
        // 使用与updatePreview相同的ID生成逻辑：基于标题索引
        const tocHtml = headings.map((heading, headingIndex) => {
            const text = heading.text.trim()
            const id = this.generateValidId(text, headingIndex)
            return `<a href="#${id}" class="toc-item level-${heading.level}" data-line="${heading.line}" data-heading-index="${headingIndex}">
                ${heading.text}
            </a>`
        }).join('')
        
        tocContent.innerHTML = tocHtml
        
        // 如果有标题且目录未显示，自动显示目录
        if (!this.isTocVisible) {
            this.isTocVisible = true
            tocSidebar.classList.add('active')
        }
        
        // 使用事件委托来处理点击事件，避免重复绑定
        this.setupTocClickHandler()
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
                    insert: ''
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

    // 清理HTML内容，去除可能导致样式冲突的类名和属性
    cleanElementForExport(html) {
        // 创建临时div来处理HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        
        // 递归清理所有元素
        const cleanElement = (element) => {
            if (element.nodeType === Node.ELEMENT_NODE) {
                // 移除所有class属性
                element.removeAttribute('class')
                // 移除style属性中可能包含现代颜色函数的部分
                element.removeAttribute('style')
                // 移除data属性
                const attributes = [...element.attributes]
                attributes.forEach(attr => {
                    if (attr.name.startsWith('data-')) {
                        element.removeAttribute(attr.name)
                    }
                })
                
                // 递归处理子元素
                Array.from(element.children).forEach(cleanElement)
            }
        }
        
        Array.from(tempDiv.children).forEach(cleanElement)
        return tempDiv.innerHTML
    }

    async exportFile(format) {
        const previewElement = document.getElementById('preview')
        
        if (!previewElement) {
            alert('预览内容为空，无法导出')
            return
        }

        try {
            switch (format) {
                case 'html':
                    const htmlContent = previewElement.innerHTML
                    const blob = new Blob([htmlContent], { type: 'text/html' })
                    saveAs(blob, 'document.html')
                    break
                case 'pdf':
                    await this.exportPDF(previewElement)
                    break
                case 'png':
                case 'jpg':
                case 'webp':
                    const imageFormat = format === 'jpg' ? 'jpeg' : format
                    await this.exportImage(previewElement, imageFormat)
                    break
                default:
                    alert('不支持的导出格式')
            }
        } catch (error) {
            console.error('导出失败:', error)
            alert(`导出失败: ${error.message}`)
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
        try {
            // 确保元素可见且有内容
            if (!element || element.children.length === 0) {
                throw new Error('预览内容为空，无法导出PDF')
            }

            // 根据当前主题设置背景颜色
            const backgroundColor = this.isDarkMode ? '#1a1a1a' : '#ffffff'
            const textColor = this.isDarkMode ? '#ffffff' : '#000000'

            // 创建一个完全隔离的iframe来避免样式冲突
            const iframe = document.createElement('iframe')
            iframe.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: 800px;
                height: 600px;
                border: none;
            `
            document.body.appendChild(iframe)
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
            
            // 在iframe中创建基础HTML结构，不引入任何外部样式
            iframeDoc.open()
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: ${textColor};
                            background-color: ${backgroundColor};
                            padding: 20px;
                            width: 800px;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            margin: 1em 0 0.5em 0;
                            color: ${textColor};
                        }
                        p {
                            margin: 0.5em 0;
                        }
                        pre {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            color: ${textColor};
                            padding: 16px;
                            border-radius: 6px;
                            overflow-x: auto;
                            margin: 1em 0;
                        }
                        code {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            color: ${textColor};
                            padding: 2px 4px;
                            border-radius: 3px;
                            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                        }
                        blockquote {
                            border-left: 4px solid ${this.isDarkMode ? '#444' : '#ddd'};
                            margin: 1em 0;
                            padding-left: 1em;
                            color: ${this.isDarkMode ? '#ccc' : '#666'};
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1em 0;
                        }
                        th, td {
                            border: 1px solid ${this.isDarkMode ? '#444' : '#ddd'};
                            padding: 8px 12px;
                            text-align: left;
                        }
                        th {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            font-weight: 600;
                        }
                        ul, ol {
                            margin: 0.5em 0;
                            padding-left: 2em;
                        }
                        li {
                            margin: 0.25em 0;
                        }
                        a {
                            color: ${this.isDarkMode ? '#58a6ff' : '#0969da'};
                            text-decoration: none;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <div id="content"></div>
                </body>
                </html>
            `)
            iframeDoc.close()
            
            // 等待iframe加载完成
            await new Promise(resolve => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.onload = resolve
                } else {
                    setTimeout(resolve, 100)
                }
            })
            
            // 将内容复制到iframe中，去除所有样式类
            const contentDiv = iframeDoc.getElementById('content')
            const cleanContent = this.cleanElementForExport(element.innerHTML)
            contentDiv.innerHTML = cleanContent
            
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: backgroundColor,
                width: 800,
                height: contentDiv.scrollHeight,
                logging: false
            })
            
            // 清理iframe
            document.body.removeChild(iframe)
            
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
        } catch (error) {
            console.error('PDF导出失败:', error)
            throw error
        }
    }

    async exportImage(element, format) {
        try {
            // 确保元素可见且有内容
            if (!element || element.children.length === 0) {
                throw new Error('预览内容为空，无法导出图片')
            }

            // 根据当前主题设置背景颜色
            const backgroundColor = this.isDarkMode ? '#1a1a1a' : '#ffffff'
            const textColor = this.isDarkMode ? '#ffffff' : '#000000'

            // 创建一个完全隔离的iframe来避免样式冲突
            const iframe = document.createElement('iframe')
            iframe.style.cssText = `
                position: absolute;
                top: -9999px;
                left: -9999px;
                width: 800px;
                height: 600px;
                border: none;
            `
            document.body.appendChild(iframe)
            
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
            
            // 在iframe中创建基础HTML结构，不引入任何外部样式
            iframeDoc.open()
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: ${textColor};
                            background-color: ${backgroundColor};
                            padding: 20px;
                            width: 800px;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            margin: 1em 0 0.5em 0;
                            color: ${textColor};
                        }
                        p {
                            margin: 0.5em 0;
                        }
                        pre {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            color: ${textColor};
                            padding: 16px;
                            border-radius: 6px;
                            overflow-x: auto;
                            margin: 1em 0;
                        }
                        code {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            color: ${textColor};
                            padding: 2px 4px;
                            border-radius: 3px;
                            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                        }
                        blockquote {
                            border-left: 4px solid ${this.isDarkMode ? '#444' : '#ddd'};
                            margin: 1em 0;
                            padding-left: 1em;
                            color: ${this.isDarkMode ? '#ccc' : '#666'};
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1em 0;
                        }
                        th, td {
                            border: 1px solid ${this.isDarkMode ? '#444' : '#ddd'};
                            padding: 8px 12px;
                            text-align: left;
                        }
                        th {
                            background-color: ${this.isDarkMode ? '#2d2d2d' : '#f6f8fa'};
                            font-weight: 600;
                        }
                        ul, ol {
                            margin: 0.5em 0;
                            padding-left: 2em;
                        }
                        li {
                            margin: 0.25em 0;
                        }
                        a {
                            color: ${this.isDarkMode ? '#58a6ff' : '#0969da'};
                            text-decoration: none;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <div id="content"></div>
                </body>
                </html>
            `)
            iframeDoc.close()
            
            // 等待iframe加载完成
            await new Promise(resolve => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.onload = resolve
                } else {
                    setTimeout(resolve, 100)
                }
            })
            
            // 将内容复制到iframe中，去除所有样式类
            const contentDiv = iframeDoc.getElementById('content')
            const cleanContent = this.cleanElementForExport(element.innerHTML)
            contentDiv.innerHTML = cleanContent
            
            const canvas = await html2canvas(contentDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: backgroundColor,
                width: 800,
                height: contentDiv.scrollHeight,
                logging: false
            })
            
            // 清理iframe
            document.body.removeChild(iframe)
            
            // 使用Promise包装toBlob以便正确处理异步
            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const extension = format === 'jpeg' ? 'jpg' : format
                        saveAs(blob, `document.${extension}`)
                        resolve()
                    } else {
                        reject(new Error('图片生成失败'))
                    }
                }, `image/${format}`, 0.9)
            })
        } catch (error) {
            console.error('图片导出失败:', error)
            throw error
        }
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