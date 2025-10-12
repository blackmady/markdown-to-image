#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 更新HTML中显示的版本号
 * 从package.json读取版本号并更新到index.html中
 */

function updateVersionDisplay() {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const indexHtmlPath = path.join(__dirname, '..', 'index.html');
    
    try {
        // 读取 package.json 获取当前版本号
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const currentVersion = packageJson.version;
        
        // 读取 index.html
        let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
        
        // 使用正则表达式匹配并替换版本号
        const versionRegex = /<span class="app-version">v[\d.]+<\/span>/;
        const newVersionTag = `<span class="app-version">v${currentVersion}</span>`;
        
        if (versionRegex.test(htmlContent)) {
            // 替换现有版本号
            htmlContent = htmlContent.replace(versionRegex, newVersionTag);
        } else {
            // 如果没有找到版本号标签，在app-title后添加
            const titleRegex = /(<span class="app-title"[^>]*>.*?<\/span>)/;
            if (titleRegex.test(htmlContent)) {
                htmlContent = htmlContent.replace(titleRegex, `$1\n          ${newVersionTag}`);
            } else {
                console.warn('警告: 未找到app-title元素，无法添加版本号显示');
                return;
            }
        }
        
        // 写回文件
        fs.writeFileSync(indexHtmlPath, htmlContent);
        
        console.log(`HTML中的版本号已更新为: v${currentVersion}`);
        
    } catch (error) {
        console.error('更新版本号显示失败:', error.message);
        process.exit(1);
    }
}

// 执行更新
updateVersionDisplay();