# MCP Fetch Page

Browser-based web page fetching with automatic cookie support and CSS selector extraction.

## Features

- 🤖 **Browser Automation**: Full JavaScript rendering with Puppeteer
- 🍪 **Automatic Cookie Management**: Loads all saved cookies automatically
- 🎯 **CSS Selector Support**: Extract specific content with selectors
- 🌐 **Domain Presets**: Built-in selectors for common websites
- 📱 **SPA Support**: Fully supports dynamic content and AJAX

## Quick Start

### 1. Configure MCP Server

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

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

To customize runtime data directory (recommended on VPS), set `MCP_FETCH_PAGE_DATA_DIR` in MCP `env`:

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

Restart Claude Desktop.

### 2. Install Chrome Extension (Optional - for authenticated pages)

Download and install the Chrome extension to save cookies from authenticated sessions:

**[📥 Download Extension from Releases](https://github.com/kaiye/mcp-fetch-page/releases/latest)**

Installation steps:
1. Download `mcp-fetch-page-extension-vX.X.X.zip` from the latest release
2. Unzip the file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (top right)
5. Click "Load unpacked" and select the unzipped folder

## Usage

### Basic Usage
1. **Login** to a website in Chrome
2. **Click** the "Fetch Page MCP Tools" extension icon  
3. **Click** "Save Cookies" button
4. **Use** in Claude/Cursor: `fetchpage(url="https://example.com")`

### Advanced Usage

```javascript
// Basic fetching with automatic cookie loading
fetchpage(url="https://example.com")

// Extract specific content with CSS selector
fetchpage(url="https://example.com", waitFor="#main-content")

// WeChat articles (automatic selector)
fetchpage(url="https://mp.weixin.qq.com/s/xxxxx")

// Run in non-headless mode for debugging
fetchpage(url="https://example.com", headless=false)
```

### Domain Presets

The system automatically uses optimized selectors for:
- **mp.weixin.qq.com** → `.rich_media_wrp` (WeChat articles)
- **wx.zsxq.com** → `.content` (Knowledge Planet)
- **cnblogs.com** → `.post` (Blog Garden)
- Add more in `mcp-server/domain-rules.json` (`domain-selectors.json` remains supported for compatibility)

### Debug Tools

```bash
# Standalone debug script (recommended for development)
cd mcp-server
node debug.js test-page "https://example.com"
node debug.js test-spa "https://example.com" "#content"

# MCP Inspector (for integration testing)
npx @modelcontextprotocol/inspector
# Then visit http://localhost:6274
```

### Data Directory (Optional)

By default, runtime data is stored under `~/Downloads/mcp-fetch-page/`:
- Cookies: `~/Downloads/mcp-fetch-page/cookies`
- Pages: `~/Downloads/mcp-fetch-page/pages`

For MCP usage, configure `MCP_FETCH_PAGE_DATA_DIR` in your MCP client config `env` field.
The server will always use:
- `<MCP_FETCH_PAGE_DATA_DIR>/cookies`
- `<MCP_FETCH_PAGE_DATA_DIR>/pages`

`node mcp-server/server.js` is only for local development/debugging.

## Parameters

- `url` (required): The URL to fetch
- `waitFor` (optional): CSS selector to extract specific content
- `headless` (optional): Run browser in headless mode (default: true)
- `timeout` (optional): Timeout in milliseconds (default: 30000)

## File Structure

```
mcp-fetch-page/
├── package.json              # npm package config
├── package-lock.json         # npm lockfile
├── node_modules/             # npm dependencies
├── README.md                 # This file
├── README-zh.md              # Chinese version
├── CLAUDE.md                 # Claude Code usage guide
├── chrome-extension/         # Chrome extension
│   ├── manifest.json
│   ├── popup.js
│   ├── popup.html
│   └── background.js
└── mcp-server/              # MCP server
    ├── server.js            # Main server
    ├── debug.js             # Debug tools
    ├── domain-rules.json     # Domain rules config (selector + blocked markers)
    └── domain-selectors.json # Legacy selector config (compatibility fallback)
```

## Troubleshooting

- **Extension not working**: Make sure you're on a normal website (not chrome:// pages)
- **No cookies found**: Try logging in again and saving cookies
- **MCP not connecting**: Check Node.js installation and restart your editor
- **Path error**: Set `MCP_FETCH_PAGE_DATA_DIR` in MCP config `env` to a writable absolute path on your machine/VPS
- **CSS selector not working**: Verify the selector exists on the page

That's it! 🍪
