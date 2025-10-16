// 国际化配置
const translations = {
    'zh-CN': {
        // 应用标题
        appTitle: 'Markdown 预览编辑转换工具',
        
        // 工具栏
        toolbar: {
            toggleToc: '切换目录',
            fullscreen: '全屏编辑',
            newFile: '新建文件',
            openFile: '打开文件',
            saveFile: '保存文件',
            export: '导出',
            share: '分享',
            githubStar: 'GitHub Star',
            githubIssues: 'GitHub Issues',
            language: '选择语言',
            theme: '切换主题',
            // 富文本编辑器工具栏
            bold: '粗体',
            italic: '斜体',
            strikethrough: '删除线',
            inlineCode: '行内代码',
            heading1: '一级标题',
            heading2: '二级标题',
            heading3: '三级标题',
            unorderedList: '无序列表',
            orderedList: '有序列表',
            blockquote: '引用',
            codeBlock: '代码块',
            link: '链接',
            image: '图片',
            table: '表格',
            mermaid: 'Mermaid 图表',
            mermaidFlowchart: '流程图',
            mermaidSequence: '序列图',
            mermaidGantt: '甘特图',
            mermaidPie: '饼图',
            latex: 'LaTeX 公式',
            latexInline: '行内公式',
            latexBlock: '块级公式',
            latexFraction: '分数',
            latexIntegral: '积分',
            latexMatrix: '矩阵'
        },
        
        // 分享功能
        share: {
            title: '分享到',
            facebook: 'Facebook',
            twitter: 'X',
            linkedin: 'LinkedIn',
            reddit: 'Reddit',
            weibo: '微博',
            qq: 'QQ空间',
            telegram: 'Telegram',
            whatsapp: 'WhatsApp',
            success: '分享链接已打开'
        },
        
        // 导出菜单
        export: {
            html: '导出 HTML',
            pdf: '导出 PDF',
            png: '导出 PNG',
            jpg: '导出 JPG',
            webp: '导出 WEBP',
            markdown: '导出 Markdown'
        },
        
        // 目录
        toc: {
            title: '目录',
            empty: '暂无目录'
        },
        
        // 编辑器
        editor: {
            title: 'Markdown 编辑器',
            wordWrap: '自动换行'
        },
        
        // 预览
        preview: {
            title: '预览',
            syncScroll: '同步滚动'
        },
        
        // 历史文档
        history: {
            title: '历史文档',
            empty: '暂无历史文档',
            delete: '删除',
            deleteConfirm: '确定要删除这个文档吗？',
            deleteSuccess: '文档已删除',
            deleteFailed: '删除文档失败，请重试',
            duplicateTitle: '标题重复',
            overwriteConfirm: '已存在相同标题的文档，是否覆盖？',
            overwrite: '覆盖',
            cancel: '取消'
        },
        
        // 状态条
        statusBar: {
            lines: '行',
            words: '字',
            characters: '字符',
            selection: '已选择',
            position: '位置',
            column: '列',
            readingTime: '阅读时间',
            minutes: '分钟',
            seconds: '秒'
        },
        
        // SEO 元数据
        seo: {
            title: 'Markdown 预览编辑转换工具 - 在线 Markdown 编辑器和转换器',
            description: '功能强大的在线 Markdown 编辑器，支持实时预览、多格式导出（HTML、PDF、PNG、JPG、WEBP）、数学公式渲染、代码高亮、目录生成等功能。',
            keywords: 'Markdown编辑器,在线编辑器,Markdown转换,PDF导出,图片导出,数学公式,代码高亮,实时预览',
            author: 'blackmady'
        }
    },
    
    'zh-TW': {
        // 應用標題
        appTitle: 'Markdown 預覽編輯轉換工具',
        
        // 工具欄
        toolbar: {
            toggleToc: '切換目錄',
            fullscreen: '全屏編輯',
            newFile: '新建檔案',
            openFile: '開啟檔案',
            saveFile: '儲存檔案',
            export: '匯出',
            share: '分享',
            githubStar: 'GitHub Star',
            githubIssues: 'GitHub Issues',
            language: '選擇語言',
            theme: '切換主題',
            // 富文本編輯器工具欄
            bold: '粗體',
            italic: '斜體',
            strikethrough: '刪除線',
            inlineCode: '行內程式碼',
            heading1: '一級標題',
            heading2: '二級標題',
            heading3: '三級標題',
            unorderedList: '無序清單',
            orderedList: '有序清單',
            blockquote: '引用',
            codeBlock: '程式碼區塊',
            link: '連結',
            image: '圖片',
            table: '表格',
            mermaid: 'Mermaid 圖表',
            mermaidFlowchart: '流程圖',
            mermaidSequence: '序列圖',
            mermaidGantt: '甘特圖',
            mermaidPie: '圓餅圖',
            latex: 'LaTeX 公式',
            latexInline: '行內公式',
            latexBlock: '區塊級公式',
            latexFraction: '分數',
            latexIntegral: '積分',
            latexMatrix: '矩陣'
        },

                // 分享功能
        share: {
            title: '分享到',
            facebook: 'Facebook',
            twitter: 'X',
            linkedin: 'LinkedIn',
            reddit: 'Reddit',
            weibo: '微博',
            qq: 'QQ空間',
            telegram: 'Telegram',
            whatsapp: 'WhatsApp',
            success: '分享連結已開啟'
        },
        
        // 导出菜单
        export: {
            html: '匯出 HTML',
            pdf: '匯出 PDF',
            png: '匯出 PNG',
            jpg: '匯出 JPG',
            webp: '匯出 WEBP',
            markdown: '匯出 Markdown'
        },
        
        // 目錄
        toc: {
            title: '目錄',
            empty: '暫無目錄'
        },
        
        // 編輯器
        editor: {
            title: 'Markdown 編輯器',
            wordWrap: '自動換行'
        },
        
        // 预览
        preview: {
            title: '預覽',
            syncScroll: '同步捲動'
        },
        
        // 歷史文檔
        history: {
            title: '歷史文檔',
            empty: '暫無歷史文檔',
            delete: '刪除',
            deleteConfirm: '確定要刪除這個文檔嗎？',
            deleteSuccess: '文檔已刪除',
            deleteFailed: '刪除文檔失敗，請重試',
            duplicateTitle: '標題重複',
            overwriteConfirm: '已存在相同標題的文檔，是否覆蓋？',
            overwrite: '覆蓋',
            cancel: '取消'
        },
        
        // 狀態條
        statusBar: {
            lines: '行',
            words: '字',
            characters: '字符',
            selection: '已選擇',
            position: '位置',
            column: '列',
            readingTime: '閱讀時間',
            minutes: '分鐘',
            seconds: '秒'
        },
        
        // SEO 元數據
        seo: {
            title: 'Markdown 預覽編輯轉換工具 - 線上 Markdown 編輯器和轉換器',
            description: '功能強大的線上 Markdown 編輯器，支援即時預覽、多格式匯出（HTML、PDF、PNG、JPG、WEBP）、數學公式渲染、程式碼高亮、目錄生成等功能。',
            keywords: 'Markdown編輯器,線上編輯器,Markdown轉換,PDF匯出,圖片匯出,數學公式,程式碼高亮,即時預覽',
            author: 'blackmady'
        }
    },
    
    'en': {
        // Application Title
        appTitle: 'Markdown Preview Edit Converter',
        
        // Toolbar
        toolbar: {
            toggleToc: 'Toggle TOC',
            fullscreen: 'Fullscreen',
            newFile: 'New File',
            openFile: 'Open File',
            saveFile: 'Save File',
            export: 'Export',
            share: 'Share',
            githubStar: 'GitHub Star',
            githubIssues: 'GitHub Issues',
            language: 'Language',
            theme: 'Toggle Theme',
            // Rich Text Editor Toolbar
            bold: 'Bold',
            italic: 'Italic',
            strikethrough: 'Strikethrough',
            inlineCode: 'Inline Code',
            heading1: 'Heading 1',
            heading2: 'Heading 2',
            heading3: 'Heading 3',
            unorderedList: 'Unordered List',
            orderedList: 'Ordered List',
            blockquote: 'Blockquote',
            codeBlock: 'Code Block',
            link: 'Link',
            image: 'Image',
            table: 'Table',
            mermaid: 'Mermaid Diagram',
            mermaidFlowchart: 'Flowchart',
            mermaidSequence: 'Sequence Diagram',
            mermaidGantt: 'Gantt Chart',
            mermaidPie: 'Pie Chart',
            latex: 'LaTeX Formula',
            latexInline: 'Inline Formula',
            latexBlock: 'Block Formula',
            latexFraction: 'Fraction',
            latexIntegral: 'Integral',
            latexMatrix: 'Matrix'
        },
        
        // Share functionality
        share: {
            title: 'Share to',
            facebook: 'Facebook',
            twitter: 'X',
            linkedin: 'LinkedIn',
            reddit: 'Reddit',
            weibo: 'Weibo',
            qq: 'QQ Zone',
            telegram: 'Telegram',
            whatsapp: 'WhatsApp',
            success: 'Share link opened'
        },
        
        // Export menu
        export: {
            html: 'Export HTML',
            pdf: 'Export PDF',
            png: 'Export PNG',
            jpg: 'Export JPG',
            webp: 'Export WEBP',
            markdown: 'Export Markdown'
        },
        
        // Table of Contents
        toc: {
            title: 'Table of Contents',
            empty: 'No headings found'
        },
        
        // Editor
        editor: {
            title: 'Markdown Editor',
            wordWrap: 'Word Wrap'
        },
        
        // 预览
        preview: {
            title: 'Preview',
            syncScroll: 'Sync Scroll'
        },
        
        // History
        history: {
            title: 'History',
            empty: 'No history documents',
            delete: 'Delete',
            deleteConfirm: 'Are you sure you want to delete this document?',
            deleteSuccess: 'Document deleted',
            deleteFailed: 'Failed to delete document, please try again',
            duplicateTitle: 'Duplicate Title',
            overwriteConfirm: 'A document with the same title already exists. Do you want to overwrite it?',
            overwrite: 'Overwrite',
            cancel: 'Cancel'
        },
        
        // Status Bar
        statusBar: {
            lines: 'Lines',
            words: 'Words',
            characters: 'Characters',
            selection: 'Selected',
            position: 'Position',
            column: 'Col',
            readingTime: 'Reading Time',
            minutes: 'min',
            seconds: 'sec'
        },
        
        // SEO Metadata
        seo: {
            title: 'Markdown Preview Edit Converter - Online Markdown Editor and Converter',
            description: 'Powerful online Markdown editor with real-time preview, multi-format export (HTML, PDF, PNG, JPG, WEBP), math formula rendering, code highlighting, and table of contents generation.',
            keywords: 'Markdown editor,online editor,Markdown converter,PDF export,image export,math formulas,code highlighting,real-time preview',
            author: 'blackmady'
        }
    }
};

// 当前语言
let currentLanguage = 'zh-CN';

// 语言名称映射
const languageNames = {
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'en': 'English'
};

// 获取翻译文本
function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key; // 如果找不到翻译，返回原始key
        }
    }
    
    return value || key;
}

// 设置语言
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updatePageContent();
        updateDocumentMeta();
        updateLanguageSelector();
    }
}

// 获取当前语言
function getCurrentLanguage() {
    return currentLanguage;
}

// 初始化语言
function initI18n() {
    // 从localStorage获取保存的语言设置
    const savedLang = localStorage.getItem('language');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    } else {
        // 根据浏览器语言自动选择
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) {
            if (browserLang.includes('TW') || browserLang.includes('HK') || browserLang.includes('MO')) {
                currentLanguage = 'zh-TW';
            } else {
                currentLanguage = 'zh-CN';
            }
        } else if (browserLang.startsWith('en')) {
            currentLanguage = 'en';
        }
    }
    
    updatePageContent();
    updateDocumentMeta();
    updateLanguageSelector();
}

// 更新页面内容
function updatePageContent() {
    // 设置html lang属性
    document.documentElement.lang = currentLanguage;
    
    // 更新所有带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // 更新所有带有data-i18n-title属性的元素的title
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
    
    // 更新所有带有data-i18n-placeholder属性的元素的placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
}

// 更新文档元数据
function updateDocumentMeta() {
    const seoData = t('seo');
    
    // 更新页面标题
    document.title = seoData.title;
    
    // 更新meta描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = seoData.description;
    }
    
    // 更新meta关键词
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.content = seoData.keywords;
    }
    
    // 更新语言标签
    const metaLanguage = document.querySelector('meta[name="language"]');
    if (metaLanguage) {
        metaLanguage.content = currentLanguage;
    }
    
    // 更新Open Graph标签
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.content = seoData.title;
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.content = seoData.description;
    }
    
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
        const localeMap = {
            'zh-CN': 'zh_CN',
            'zh-TW': 'zh_TW',
            'en': 'en_US'
        };
        ogLocale.content = localeMap[currentLanguage] || 'zh_CN';
    }
    
    // 更新Twitter Card标签
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.content = seoData.title;
    }
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
        twitterDescription.content = seoData.description;
    }
    
    // 更新结构化数据
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
        try {
            const data = JSON.parse(structuredData.textContent);
            data.name = seoData.title;
            data.description = seoData.description;
            data.author.name = seoData.author;
            data.publisher.name = seoData.author;
            
            // 更新功能列表的多语言版本
            const featureListMap = {
                'zh-CN': [
                    "实时Markdown预览",
                    "数学公式支持",
                    "代码语法高亮",
                    "多格式导出(HTML/PDF/PNG/JPG/WEBP)",
                    "暗黑模式",
                    "目录导航",
                    "文件管理"
                ],
                'zh-TW': [
                    "即時Markdown預覽",
                    "數學公式支援",
                    "程式碼語法高亮",
                    "多格式匯出(HTML/PDF/PNG/JPG/WEBP)",
                    "暗黑模式",
                    "目錄導航",
                    "檔案管理"
                ],
                'en': [
                    "Real-time Markdown preview",
                    "Math formula support",
                    "Code syntax highlighting",
                    "Multi-format export (HTML/PDF/PNG/JPG/WEBP)",
                    "Dark mode",
                    "Table of contents navigation",
                    "File management"
                ]
            };
            
            data.featureList = featureListMap[currentLanguage] || featureListMap['zh-CN'];
            structuredData.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
            console.warn('Failed to update structured data:', e);
        }
    }
}

// 更新语言选择器
function updateLanguageSelector() {
    const currentLanguageElement = document.getElementById('currentLanguage');
    if (currentLanguageElement) {
        currentLanguageElement.textContent = languageNames[currentLanguage] || currentLanguage;
    }
    
    // 更新语言菜单中的选中状态
    document.querySelectorAll('.language-menu button').forEach(button => {
        const lang = button.getAttribute('data-lang');
        if (lang === currentLanguage) {
            button.style.backgroundColor = 'var(--bg-secondary)';
            button.style.fontWeight = '600';
        } else {
            button.style.backgroundColor = 'transparent';
            button.style.fontWeight = 'normal';
        }
    });
}

// 导出函数供全局使用
window.t = t;
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.initI18n = initI18n;