# MCP Fetch Page

基于浏览器的网页抓取工具，支持自动Cookie管理和CSS选择器内容提取。

## 核心特性

- 🤖 **浏览器自动化**: 使用Puppeteer完整JavaScript渲染
- 🍪 **自动Cookie管理**: 自动加载所有已保存的Cookie
- 🎯 **CSS选择器支持**: 使用选择器提取特定内容
- 🌐 **域名预设**: 内置常见网站选择器
- 📱 **SPA支持**: 完整支持动态内容和AJAX

## 快速开始

### 1. 配置 MCP 服务器

在 Claude Desktop 配置文件中添加 (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mcp-fetch-page": {
      "command": "npx",
      "args": ["-y", "mcp-fetch-page@latest"]
    }
  }
}
```

如果需要自定义运行数据目录（VPS 场景推荐），请在 MCP 配置的 `env` 中设置 `MCP_FETCH_PAGE_DATA_DIR`：

```json
{
  "mcpServers": {
    "mcp-fetch-page": {
      "command": "npx",
      "args": ["-y", "mcp-fetch-page@latest"],
      "env": {
        "MCP_FETCH_PAGE_DATA_DIR": "/data/mcp-fetch-page"
      }
    }
  }
}
```

重启 Claude Desktop。

### 2. 安装 Chrome 扩展（可选 - 用于需要登录的页面）

下载并安装 Chrome 扩展以保存已登录网站的 cookies：

**[📥 从 Releases 下载扩展](https://github.com/kaiye/mcp-fetch-page/releases/latest)**

安装步骤：
1. 从最新版本下载 `mcp-fetch-page-extension-vX.X.X.zip`
2. 解压文件
3. 打开 Chrome 并访问 `chrome://extensions/`
4. 开启"开发者模式"（右上角）
5. 点击"加载已解压的扩展程序"并选择解压后的文件夹

## 使用方法

### 基础用法
1. **登录**网站（在Chrome中）
2. **点击**"Fetch Page MCP Tools"扩展图标
3. **点击**"Save Cookies"按钮
4. **在Claude/Cursor中使用**: `fetchpage(url="https://example.com")`

### 高级用法

```javascript
// 基础抓取，自动加载Cookie
fetchpage(url="https://example.com")

// 使用CSS选择器提取特定内容
fetchpage(url="https://example.com", waitFor="#main-content")

// 微信公众号文章（自动选择器）
fetchpage(url="https://mp.weixin.qq.com/s/xxxxx")

// 非无头模式运行（用于调试）
fetchpage(url="https://example.com", headless=false)
```

### 域名预设

系统会自动为以下网站使用优化的选择器：
- **mp.weixin.qq.com** → `.rich_media_wrp` (微信公众号文章)
- **wx.zsxq.com** → `.content` (知识星球)
- **cnblogs.com** → `.post` (博客园)
- 在 `mcp-server/domain-rules.json` 中添加更多（兼容读取 `domain-selectors.json`）

### 调试工具

```bash
# 独立调试脚本（推荐用于开发调试）
cd mcp-server
node debug.js test-page "https://example.com"
node debug.js test-spa "https://example.com" "#content"

# MCP Inspector（用于集成测试）
npx @modelcontextprotocol/inspector
# 然后访问 http://localhost:6274
```

### 数据目录（可选）

默认运行数据目录为 `~/Downloads/mcp-fetch-page/`：
- Cookies: `~/Downloads/mcp-fetch-page/cookies`
- Pages: `~/Downloads/mcp-fetch-page/pages`

在 MCP 使用场景中，通过 MCP 客户端配置的 `env` 字段设置 `MCP_FETCH_PAGE_DATA_DIR`。
服务端固定使用：
- `<MCP_FETCH_PAGE_DATA_DIR>/cookies`
- `<MCP_FETCH_PAGE_DATA_DIR>/pages`

`node mcp-server/server.js` 仅用于本地开发/调试。

## 参数说明

- `url` (必需): 要抓取的URL
- `waitFor` (可选): CSS选择器，提取特定内容
- `headless` (可选): 浏览器无头模式 (默认: true)
- `timeout` (可选): 超时时间毫秒 (默认: 30000)

## 文件结构

```
mcp-fetch-page/
├── package.json              # npm包配置
├── package-lock.json         # npm锁定文件
├── node_modules/             # npm依赖
├── README.md                 # 英文说明
├── README-zh.md              # 中文说明（本文件）
├── CLAUDE.md                 # Claude Code使用指南
├── chrome-extension/         # Chrome扩展
│   ├── manifest.json
│   ├── popup.js
│   ├── popup.html
│   └── background.js
└── mcp-server/              # MCP服务器
    ├── server.js            # 主服务器
    ├── debug.js             # 调试工具
    ├── domain-rules.json     # 域名规则配置（selector + blocked 标记）
    └── domain-selectors.json # 旧版选择器配置（兼容回退）
```

## 常见问题

- **扩展无法使用**: 确保在正常网站使用（不是chrome://页面）
- **找不到cookies**: 重新登录网站并保存cookies
- **MCP连接失败**: 检查Node.js安装并重启编辑器
- **路径错误**: 在 MCP 配置的 `env` 中设置 `MCP_FETCH_PAGE_DATA_DIR` 为可写绝对路径
- **CSS选择器无效**: 验证选择器在页面中确实存在

就这么简单！🍪
