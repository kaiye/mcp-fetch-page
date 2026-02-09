#!/usr/bin/env node

/**
 * Debug and Test Tool for MCP FetchPage Server
 * 
 * This file provides command-line testing for the MCP server functionality.
 * 
 * Usage:
 *   node debug.js <command> [options]
 * 
 * Commands:
 *   test-page <url> [options]     - Test unified fetchpage method
 *   test-http <url>               - Force HTTP method only
 *   test-spa <url> [selector]     - Force SPA method only
 *   list-cookies [domain]         - List available cookie files
 *   show-cookie <domain>          - Show cookie file content
 * 
 * Examples:
 *   node debug.js test-page "https://example.com"
 *   node debug.js test-page "https://example.com" --force-method=spa
 *   node debug.js test-http "https://example.com"
 *   node debug.js test-spa "https://spa.example.com" "#content"
 *   node debug.js list-cookies
 *   node debug.js show-cookie "example.com"
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

function resolveDataDir() {
  const defaultDir = path.join(os.homedir(), 'Downloads', 'mcp-fetch-page');
  const configuredDir = process.env.MCP_FETCH_PAGE_DATA_DIR;
  if (!configuredDir || configuredDir.trim() === '') {
    return defaultDir;
  }

  const normalized = configuredDir.trim();
  if (normalized === '~') {
    return os.homedir();
  }
  if (normalized.startsWith('~/')) {
    return path.join(os.homedir(), normalized.slice(2));
  }
  return path.resolve(normalized);
}

const DATA_DIR = resolveDataDir();
// 使用与server.js相同的cookie目录
const COOKIE_DIR = path.join(DATA_DIR, 'cookies');

// 模拟MCP工具调用的函数
async function simulateMCPCall(toolName, args) {
  console.log(`🔧 模拟MCP调用: ${toolName}`);
  console.log(`📝 参数:`, JSON.stringify(args, null, 2));
  console.log('─'.repeat(50));
  
  // 动态导入server.js的处理函数
  try {
    const { default: server } = await import('./server.js');
    
    // 创建模拟的MCP请求
    const mockRequest = {
      params: {
        name: toolName,
        arguments: args
      }
    };
    
    // 这里需要直接调用处理函数，因为server.js的结构
    // 我们直接复制相关的处理逻辑
    if (toolName === 'fetch_with_cookies') {
      return await handleFetchWithCookies(args);
    } else if (toolName === 'fetch_spa_with_cookies') {
      return await handleFetchSpaWithCookies(args);
    }
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ 调用失败: ${error.message}`
      }]
    };
  }
}

// 简化版的cookie管理器（从server.js复制关键部分）
class SimpleCookieManager {
  findCookieFile(domain) {
    const cleanDomain = domain.replace('www.', '');
    
    if (!fs.existsSync(COOKIE_DIR)) {
      return null;
    }
    
    const files = fs.readdirSync(COOKIE_DIR);
    const baseNames = [
      `${domain}_cookies`,
      `${cleanDomain}_cookies`,
      `www.${cleanDomain}_cookies`
    ];
    
    const matchingFiles = [];
    
    for (const file of files) {
      for (const baseName of baseNames) {
        const pattern = new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s*\\(\\d+\\))?\\.json$`);
        
        if (pattern.test(file)) {
          const filePath = path.join(COOKIE_DIR, file);
          const stats = fs.statSync(filePath);
          
          matchingFiles.push({
            path: filePath,
            filename: file,
            modifiedTime: stats.mtime
          });
          break;
        }
      }
    }
    
    if (matchingFiles.length === 0) {
      return null;
    }
    
    matchingFiles.sort((a, b) => b.modifiedTime - a.modifiedTime);
    return matchingFiles[0].path;
  }

  loadCookiesFromFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
}

// 通用MCP调用函数
async function callMCPTool(toolName, args) {
  console.log(`🔧 调用MCP工具: ${toolName}`);
  
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const serverProcess = spawn('node', ['server.js'], {
      cwd: path.dirname(import.meta.url.replace('file://', '')),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // 构建MCP请求
    const mcpRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };
    
    let output = '';
    let errorOutput = '';
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    serverProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    serverProcess.on('close', (code) => {
      console.log('📋 服务器输出:', output);
      if (errorOutput) {
        console.log('⚠️ 错误输出:', errorOutput);
      }
      resolve({
        code,
        output,
        errorOutput,
        content: [{
          type: 'text',
          text: `进程退出码: ${code}\n输出: ${output}\n错误: ${errorOutput}`
        }]
      });
    });
    
    // 发送请求
    serverProcess.stdin.write(JSON.stringify(mcpRequest) + '\n');
    serverProcess.stdin.end();
    
    // 超时处理
    setTimeout(() => {
      serverProcess.kill();
      resolve({
        content: [{
          type: 'text',
          text: '❌ 请求超时'
        }]
      });
    }, 60000); // 增加超时时间以适配智能抓取
  });
}

// 简化版的处理函数（基于server.js）
async function handleFetchPage(args) {
  console.log('🚀 执行智能页面抓取...');
  return await callMCPTool('fetchpage', args);
}

async function handleFetchWithCookies(args) {
  console.log('🌐 执行标准HTTP请求...');
  return await callMCPTool('fetchpage', { ...args, forceMethod: 'http' });
}

async function handleFetchSpaWithCookies(args) {
  console.log('🤖 执行Puppeteer SPA请求...');
  return await callMCPTool('fetchpage', { ...args, forceMethod: 'spa' });
}

// 命令行处理函数

// 新的统一测试方法
async function testPage(url, options = {}) {
  console.log(`🧪 测试智能页面抓取: ${url}`);
  console.log('📝 选项:', options);
  console.log('─'.repeat(50));
  
  const args = { url, ...options };
  const result = await handleFetchPage(args);
  
  console.log('✅ 结果:');
  if (result.output) {
    try {
      // 解析JSON响应
      const lines = result.output.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const response = JSON.parse(lastLine);
      
      if (response.result && response.result.content) {
        console.log('📄 页面内容长度:', response.result.content[0].text.length, '字符');
        
        // 显示内容预览
        const content = response.result.content[0].text;
        const preview = content.substring(0, 500);
        console.log('📋 内容预览:');
        console.log(preview + (content.length > 500 ? '...' : ''));
      } else if (response.error) {
        console.log('❌ 请求失败:', response.error.message);
      }
    } catch (parseError) {
      console.log('❌ 解析响应失败:', parseError.message);
      console.log('原始输出:', result.output);
    }
  } else {
    console.log(result.content[0].text);
  }
}

async function testFetch(url) {
  console.log(`🧪 测试强制HTTP方法: ${url}`);
  const result = await handleFetchWithCookies({ url });
  console.log('✅ 结果:');
  console.log(result.content[0].text);
}

async function testSpa(url, waitFor) {
  console.log(`🧪 测试MCP SPA请求: ${url}`);
  console.log('─'.repeat(50));
  
  const { spawn } = await import('child_process');
  
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('node', ['server.js'], {
      cwd: path.dirname(import.meta.url.replace('file://', '')),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // 构建MCP请求
    const mcpRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'fetchpage',
        arguments: { 
          url,
          forceMethod: 'spa',
          headless: false, // 显示浏览器窗口用于调试
          ...(waitFor && { waitFor })
        }
      }
    };
    
    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    serverProcess.stderr.on('data', (data) => {
      // 实时显示调试信息
      process.stderr.write(data);
    });
    
    serverProcess.on('close', (code) => {
      console.log('\n📋 MCP调用完成');
      
      try {
        // 解析JSON响应
        const lines = output.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const response = JSON.parse(lastLine);
        
        if (response.result && response.result.content) {
          console.log('✅ MCP调用成功');
          console.log('📄 页面内容长度:', response.result.content[0].text.length, '字符');
          
          // 显示内容预览
          const content = response.result.content[0].text;
          const preview = content.substring(0, 500);
          console.log('📋 内容预览:');
          console.log(preview + (content.length > 500 ? '...' : ''));
          
          resolve();
        } else if (response.error) {
          console.log('❌ MCP调用失败:', response.error.message);
          reject(new Error(response.error.message));
        } else {
          console.log('❓ 未知响应格式:', response);
          reject(new Error('未知响应格式'));
        }
      } catch (parseError) {
        console.log('❌ 解析响应失败:', parseError.message);
        reject(parseError);
      }
    });
    
    // 发送请求
    console.log('📤 发送MCP请求...');
    serverProcess.stdin.write(JSON.stringify(mcpRequest) + '\n');
    serverProcess.stdin.end();
    
    // 超时处理
    setTimeout(() => {
      console.log('⏰ 请求超时，终止进程...');
      serverProcess.kill();
      reject(new Error('请求超时'));
    }, 60000);
  });
}



function listCookies(filterDomain) {
  console.log('🍪 可用的Cookie文件:');
  
  if (!fs.existsSync(COOKIE_DIR)) {
    console.log('❌ Cookie目录不存在:', COOKIE_DIR);
    return;
  }
  
  const files = fs.readdirSync(COOKIE_DIR);
  const cookieFiles = files.filter(file => file.endsWith('_cookies.json'));
  
  if (cookieFiles.length === 0) {
    console.log('❌ 没有找到Cookie文件');
    return;
  }
  
  cookieFiles.forEach(file => {
    const filePath = path.join(COOKIE_DIR, file);
    const stats = fs.statSync(filePath);
    const domain = file.replace('_cookies.json', '').replace(/\s*\(\d+\)$/, '');
    
    if (!filterDomain || domain.includes(filterDomain)) {
      console.log(`📁 ${file}`);
      console.log(`   域名: ${domain}`);
      console.log(`   修改时间: ${stats.mtime.toLocaleString()}`);
      console.log(`   大小: ${stats.size} bytes`);
      console.log('');
    }
  });
}

function showCookie(domain) {
  console.log(`🔍 显示域名 ${domain} 的Cookie信息:`);
  
  const cookieManager = new SimpleCookieManager();
  const cookieFile = cookieManager.findCookieFile(domain);
  
  if (!cookieFile) {
    console.log(`❌ 没有找到域名 ${domain} 的Cookie文件`);
    return;
  }
  
  const cookieData = cookieManager.loadCookiesFromFile(cookieFile);
  if (!cookieData) {
    console.log(`❌ 无法读取Cookie文件: ${cookieFile}`);
    return;
  }
  
  console.log(`📁 文件: ${path.basename(cookieFile)}`);
  console.log(`🌐 域名: ${cookieData.domain}`);
  console.log(`🔗 URL: ${cookieData.url}`);
  console.log(`⏰ 时间戳: ${cookieData.timestamp}`);
  console.log(`🍪 Cookie数量: ${cookieData.totalCookies || cookieData.cookies?.length || 0}`);
  console.log(`📦 LocalStorage项目: ${cookieData.totalLocalStorage || Object.keys(cookieData.localStorage || {}).length}`);
  
  if (cookieData.cookies && cookieData.cookies.length > 0) {
    console.log('\n🍪 Cookies详情:');
    cookieData.cookies.slice(0, 5).forEach((cookie, index) => {
      console.log(`  ${index + 1}. ${cookie.name} = ${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}`);
      console.log(`     域名: ${cookie.domain}, 路径: ${cookie.path}`);
    });
    
    if (cookieData.cookies.length > 5) {
      console.log(`     ... 还有 ${cookieData.cookies.length - 5} 个cookies`);
    }
  }
  
  if (cookieData.localStorage && Object.keys(cookieData.localStorage).length > 0) {
    console.log('\n📦 LocalStorage详情:');
    Object.entries(cookieData.localStorage).slice(0, 3).forEach(([key, value]) => {
      console.log(`  ${key} = ${value.toString().substring(0, 100)}${value.toString().length > 100 ? '...' : ''}`);
    });
    
    if (Object.keys(cookieData.localStorage).length > 3) {
      console.log(`  ... 还有 ${Object.keys(cookieData.localStorage).length - 3} 个项目`);
    }
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
🚀 MCP FetchPage 调试工具

用法:
  node debug.js <command> [options]

命令:
  test-page <url> [options]     测试智能页面抓取（推荐）
  test-http <url>               强制使用HTTP方法
  test-spa <url> [selector]     强制使用SPA方法（通过MCP调用）
  list-cookies [domain]         列出可用的Cookie文件
  show-cookie <domain>          显示指定域名的Cookie详情
  help                          显示此帮助信息

智能抓取选项 (test-page):
  --force-method=http|spa       强制使用特定方法
  --headless=false              显示浏览器窗口（SPA模式）
  --skip-cookies                跳过cookie加载
  --wait-for="selector"          等待特定元素（SPA模式）

示例:
  node debug.js test-page "https://example.com"
  node debug.js test-page "https://example.com" --force-method=spa
  node debug.js test-page "https://example.com" --headless=false
  node debug.js test-http "https://example.com"
  node debug.js test-spa "https://app.example.com" "#main-content"
  node debug.js list-cookies
  node debug.js show-cookie "example.com"

注意:
  - 智能抓取会自动选择最佳方法（HTTP → SPA回退）
  - Cookie会自动加载（如果可用），无需手动管理
  - 可用 MCP_FETCH_PAGE_DATA_DIR 自定义数据目录根路径
  - Cookie文件保存在: ${COOKIE_DIR}
  - 需要登录的页面会显示友好提示
`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'test-page':
        if (!args[1]) {
          console.log('❌ 请提供URL参数');
          return;
        }
        // 解析命令行选项
        const pageOptions = {};
        for (let i = 2; i < args.length; i++) {
          const arg = args[i];
          if (arg.startsWith('--force-method=')) {
            pageOptions.forceMethod = arg.split('=')[1];
          } else if (arg === '--headless=false') {
            pageOptions.headless = false;
          } else if (arg === '--skip-cookies') {
            pageOptions.skipCookies = true;
          } else if (arg.startsWith('--wait-for=')) {
            pageOptions.waitFor = arg.split('=')[1].replace(/['"]/g, '');
          }
        }
        await testPage(args[1], pageOptions);
        break;
        
      case 'test-http':
        if (!args[1]) {
          console.log('❌ 请提供URL参数');
          return;
        }
        await testFetch(args[1]);
        break;
        
      case 'test-fetch':
        if (!args[1]) {
          console.log('❌ 请提供URL参数');
          return;
        }
        await testFetch(args[1]);
        break;
        
      case 'test-spa':
        if (!args[1]) {
          console.log('❌ 请提供URL参数');
          return;
        }
        await testSpa(args[1], args[2]);
        break;
        
      case 'list-cookies':
        listCookies(args[1]);
        break;
        
      case 'show-cookie':
        if (!args[1]) {
          console.log('❌ 请提供域名参数');
          return;
        }
        showCookie(args[1]);
        break;
        
      case 'help':
        showHelp();
        break;
        
      default:
        console.log(`❌ 未知命令: ${command}`);
        showHelp();
    }
  } catch (error) {
    console.error('❌ 执行出错:', error.message);
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
