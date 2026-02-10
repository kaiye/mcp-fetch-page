# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-02-10

### Changed
- Bumped `@modelcontextprotocol/sdk` to `^1.26.0`
- Bumped `html2md4llm` to `^1.1.3`
- Synced project version to `0.5.0` in MCP server metadata and Chrome extension manifest

## [0.3.1] - 2025-10-15

### Fixed
- Fixed MCP protocol communication error caused by `console.log()` in `isCookieExpired()`
- Changed all logging to use `console.error()` to prevent stdout pollution

## [0.3.0] - 2025-10-15

### Added
- GitHub Actions workflow for automatic release packaging on tag push
- Automated Chrome extension ZIP creation and GitHub Release creation
- Comprehensive release documentation with automated workflow instructions

### Changed
- Unified version numbering to 0.3.0 across all components
- Enhanced RELEASE.md with automated and manual release procedures

## [0.1.0] - 2025-10-15

### Added
- Initial release with SPA-only architecture
- Browser automation using Puppeteer for full JavaScript rendering
- Automatic cookie management with merge-all strategy
- localStorage support per domain
- CSS selector support for content extraction
- Domain-specific selector presets
- Anti-detection features for browser automation
- Chrome extension for cookie and localStorage extraction
- GitHub Actions workflow for automatic release packaging

### Changed
- **Breaking**: Refactored from dual HTTP/SPA architecture to SPA-only
- **Breaking**: Removed `forceMethod` parameter (no longer needed)
- **Breaking**: Removed `skipCookies` parameter (cookies always auto-loaded)
- **Breaking**: Removed `cookies` parameter (replaced with automatic loading)
- Simplified codebase by ~44% (754 lines removed)
- Updated directory paths from `mcp-fetchpage` to `mcp-fetch-page`
- Improved cookie expiration handling using actual expiration dates

### Removed
- HTTP-based fetching method
- `htmlToMarkdown()` string-based parser
- `makeRequest()` HTTP client
- `detectInvalidCookieResponse()` validator
- `handleFetchWithCookies()` HTTP handler
- `analyzePageContent()` content analyzer
- `handleFetchPage()` smart routing handler

### Fixed
- CSS content leaking into Markdown output (now uses DOM-based parsing)
- Inconsistent behavior between HTTP and SPA methods
- Cookie loading issues with cross-domain redirects

## Previous Versions

### [2.0.1] - 2024-XX-XX
- Support for 302 redirects
- Fixed Chrome extension download path issues

### [2.0.0] - 2024-XX-XX
- Refactored as npm package
- Improved installation documentation
- Repository directory renaming
