# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**智能提示词管理平台**是一个基于浏览器本地存储的单页面应用，专为AI内容创作者设计的提示词管理工具。项目采用纯前端架构，无需后端服务，所有数据存储在localStorage中。

## Architecture

### Technology Stack
- **Frontend**: HTML5 + TailwindCSS + Vanilla JavaScript
- **Storage**: Browser localStorage (模拟数据库)
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Noto Sans SC (Google Fonts)

### Core Components
- `index.html` - 主应用页面（单页面应用）
- `app.js` - 核心业务逻辑和状态管理
- 无构建步骤，可直接在浏览器中打开

### Data Model
```javascript
// 用户数据结构
{
  username: string,
  password: string,
  isAdmin?: boolean
}

// 提示词数据结构
{
  id: string,
  title: string,
  category: string,
  userId: string,
  versions: [{id, name, content}],
  currentVersion: number,
  createdAt: string,
  updatedAt: string
}
```

### Key Features Implemented
1. **用户认证系统** - 注册/登录/退出，支持管理员权限
2. **个人工作台** - 提示词CRUD操作，多版本管理
3. **提示词广场** - 官方模板浏览和使用
4. **飞书集成** - 配置管理和模拟数据导入
5. **后台管理** - 管理员专用内容维护界面

## Development Commands

### Quick Start
```bash
# 直接打开应用
open index.html
# 或
start index.html
```

### Testing Accounts
- **普通用户**: user / user123
- **管理员**: admin / admin123

### Development Features
- 所有数据存储在浏览器localStorage中
- 支持热重载（刷新页面即可查看最新更改）
- 控制台调试：`localStorage.clear()` 可重置所有数据

### File Structure
```
├── index.html          # 主应用页面
├── app.js             # 核心JavaScript逻辑
├── 智能提示词管理平台-灵感工作室.html  # 设计原型
└── CLAUDE.md          # 开发指南
```

### Key Functions in app.js
- `initApp()` - 应用初始化
- `showPage()` - 页面路由管理
- `loadPrompts()` - 加载个人提示词
- `manageVersions()` - 版本管理核心功能
- `importFromFeishu()` - 飞书数据导入

### Storage Keys
- `currentUser` - 当前登录用户
- `users` - 用户数据库
- `prompts` - 个人提示词数据
- `squarePrompts` - 广场提示词数据
- `categories` - 个人分类
- `squareCategories` - 广场分类