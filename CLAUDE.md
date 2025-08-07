# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**智能提示词管理平台** is a single-page web application for AI content creators to manage prompt templates. Uses pure frontend architecture with browser localStorage as the database.

## Architecture Highlights

### Technology Stack
- **Frontend**: Vanilla JavaScript + TailwindCSS + HTML5
- **Storage**: Browser localStorage (simulated database)
- **Styling**: TailwindCSS via CDN
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Noto Sans SC (Google Fonts)
- **Development**: Playwright MCP Server for browser automation

### Key Architecture Patterns
- **Single Page Application**: All pages rendered via JavaScript routing
- **Event-Driven Architecture**: Direct event binding to DOM elements
- **Local Storage ORM**: JSON-based CRUD operations
- **Version Management**: Multi-version prompt support with inline editing
- **Responsive Design**: Mobile-first with TailwindCSS

## Core Files

### Main Application Files
- `index.html` - Single page application shell
- `app.js` - Complete business logic and state management
- `package.json` - Dependencies (Playwright MCP only)
- `mcp.json` - MCP server configuration

### Data Flow
```
User Interaction → Event Handler → localStorage → DOM Update → Visual Feedback
```

## Development Commands

### Quick Start
```bash
# Open directly in browser
open index.html                    # macOS
start index.html                   # Windows
xdg-open index.html                # Linux

# Install dependencies (if needed)
npm install

# Start MCP server for browser automation
npx @playwright/mcp@latest
```

### Testing Workflow
1. **Manual Testing**: Open index.html directly
2. **Reset Data**: `localStorage.clear()` in browser console
3. **Test Accounts**: 
   - Regular: user/user123
   - Admin: admin/admin123

## Key Functional Areas

### 1. Authentication System
- **Location**: `handleAuth()` in app.js:117-159
- **Storage**: `users` key in localStorage
- **Features**: Login/Register, admin detection, session persistence

### 2. Version Management (Latest Refactor)
- **Location**: `loadVersionsToPanel()` in app.js:416-486
- **Architecture**: 
  - Direct click binding to individual icons
  - `handleVersionRenameByIcon()` for pencil icon
  - `handleVersionDeleteByIcon()` for delete icon
  - `event.stopPropagation()` prevents chain reactions
- **UI**: Hover-reveal icons with smooth transitions

### 3. Data Management
- **Core Models**:
  ```javascript
  // User: {username, password, isAdmin?}
  // Prompt: {id, title, category, userId, versions[], currentVersion}
  // Version: {id, name, content}
  ```
- **Storage Keys**: `currentUser`, `users`, `prompts`, `squarePrompts`, `categories`

### 4. Page Routing
- **Router**: `showPage()` in app.js:89-114
- **Pages**: auth, workbench, square, settings, admin
- **State**: URL-based routing via data-page attributes

## Development Patterns

### Event Binding Strategy
- **Direct Binding**: Each icon has its own event listener
- **No Delegation**: Eliminates chain reaction bugs
- **Immediate Feedback**: No confirmation dialogs
- **Clean Removal**: All deprecated handlers removed

### DOM Manipulation
- **Template Creation**: Dynamic element creation via `document.createElement`
- **State Sync**: Immediate localStorage update after DOM changes
- **Visual Feedback**: Toast notifications via `showToast()`

### State Management
- **Single Source**: localStorage as the only state store
- **Reactive Updates**: DOM re-renders after state changes
- **Version Control**: Automatic activation switching on deletion

## Testing Guidelines

### Version Management Testing
1. Create prompt with multiple versions
2. Hover over version tags to reveal icons
3. Click pencil icon: inline rename should trigger
4. Click X icon: immediate deletion without confirmation
5. Verify single version hides delete icon
6. Check activation state switches correctly after deletion

### Browser Console Commands
```javascript
// Reset all data
localStorage.clear(); location.reload();

// View current data
console.table(JSON.parse(localStorage.getItem('prompts')));

// Test version management
const prompt = JSON.parse(localStorage.getItem('prompts'))[0];
```

## Architecture Notes
- **No Build Step**: Direct browser execution
- **Zero Dependencies Runtime**: Only TailwindCSS CDN
- **Offline Capable**: Works without internet after initial load
- **Mobile Optimized**: Responsive via TailwindCSS
- **Event Isolation**: Each interaction is completely independent

## Recent Major Changes
- **Version Management**: Complete refactor from double-click to click-based interactions
- **Event Architecture**: Eliminated all event delegation for direct binding
- **UI Polish**: Added hover-reveal icons with smooth transitions
- **Code Cleanup**: Removed all deprecated modal and confirmation logic