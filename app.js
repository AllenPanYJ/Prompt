// 智能提示词管理平台 - 核心JavaScript代码

// 数据存储
let currentUser = null;
let prompts = [];
let squarePrompts = [];
let categories = [];
let squareCategories = [];
let currentPage = 'auth';
let editingPromptId = null;
let currentPromptVersions = {};

// 模拟数据存储
const storage = {
    get: (key) => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// 初始化应用
function initApp() {
    currentUser = storage.get('currentUser');
    prompts = storage.get('prompts') || [];
    squarePrompts = storage.get('squarePrompts') || getDefaultSquarePrompts();
    categories = storage.get('categories') || [];
    squareCategories = storage.get('squareCategories') || getDefaultSquareCategories();
    
    // 如果用户已登录，显示工作台
    if (currentUser) {
        showPage('workbench');
        updateUserMenu();
        loadPrompts();
        loadCategories();
    } else {
        showPage('auth');
    }
    
    // 检查是否是管理员
    if (currentUser && currentUser.username === 'admin') {
        document.getElementById('admin-link').classList.remove('hidden');
    }
    
    bindEvents();
}

// 默认广场提示词
function getDefaultSquarePrompts() {
    return [
        {
            id: 'square-1',
            title: '小红书爆款文案生成器',
            category: '内容创作',
            content: '你是一位专业的小红书内容创作者，请根据以下要求创作一篇爆款笔记...',
            versions: [{id: 'v1', name: '标准版', content: '你是一位专业的小红书内容创作者，请创作一篇爆款笔记...'}],
            currentVersion: 0
        },
        {
            id: 'square-2',
            title: 'React组件生成助手',
            category: '代码开发',
            content: '作为资深React开发者，请帮我生成一个现代化的、响应式的用户卡片组件...',
            versions: [{id: 'v1', name: '完整版', content: '作为资深React开发者，请生成一个现代化的用户卡片组件...'}],
            currentVersion: 0
        },
        {
            id: 'square-3',
            title: '营销文案优化专家',
            category: '营销文案',
            content: '你是一位资深营销文案专家，请帮我优化以下产品文案...',
            versions: [{id: 'v1', name: '优化版', content: '作为营销文案专家，请优化产品文案，提升转化率...'}],
            currentVersion: 0
        }
    ];
}

// 默认广场分类
function getDefaultSquareCategories() {
    return ['内容创作', '代码开发', '营销文案', '教育培训', '生活助手'];
}

// 页面切换
function showPage(page) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');
    
    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('text-orange-500'));
    document.querySelector(`[data-page="${page}"]`)?.classList.add('text-orange-500');
    
    currentPage = page;
    
    // 根据页面加载相应数据
    switch(page) {
        case 'workbench':
            loadPrompts();
            loadCategories();
            break;
        case 'square':
            loadSquarePrompts();
            loadSquareCategories();
            break;
        case 'admin':
            loadAdminData();
            break;
    }
}

// 用户认证系统
function handleAuth(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const isLogin = document.getElementById('auth-title').textContent === '登录账号';
    
    if (isLogin) {
        // 登录逻辑
        const users = storage.get('users') || {};
        if (users[username] && users[username].password === password) {
            currentUser = { username, ...users[username] };
            storage.set('currentUser', currentUser);
            showPage('workbench');
            updateUserMenu();
            
            // 检查管理员权限
            if (username === 'admin') {
                document.getElementById('admin-link').classList.remove('hidden');
            }
            
            showToast('登录成功！');
        } else {
            showToast('用户名或密码错误！');
        }
    } else {
        // 注册逻辑
        const users = storage.get('users') || {};
        if (users[username]) {
            showToast('用户名已存在！');
            return;
        }
        
        users[username] = { password, createdAt: new Date().toISOString() };
        storage.set('users', users);
        
        currentUser = { username, ...users[username] };
        storage.set('currentUser', currentUser);
        showPage('workbench');
        updateUserMenu();
        showToast('注册成功！');
    }
}

// 切换登录/注册
function toggleAuthMode() {
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit');
    const switchText = document.getElementById('auth-switch-text');
    const switchLink = document.getElementById('auth-switch');
    
    if (title.textContent === '登录账号') {
        title.textContent = '注册账号';
        submitBtn.textContent = '注册';
        switchText.textContent = '已有账号？';
        switchLink.textContent = '立即登录';
    } else {
        title.textContent = '登录账号';
        submitBtn.textContent = '登录';
        switchText.textContent = '还没有账号？';
        switchLink.textContent = '立即注册';
    }
}

// 退出登录
function logout() {
    currentUser = null;
    storage.remove('currentUser');
    showPage('auth');
    updateUserMenu();
    document.getElementById('admin-link').classList.add('hidden');
    showToast('已退出登录');
}

// 更新用户菜单
function updateUserMenu() {
    const loginBtn = document.getElementById('login-btn');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');
    const fabAddPrompt = document.getElementById('fab-add-prompt');
    
    if (currentUser) {
        loginBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        usernameDisplay.textContent = currentUser.username;
        fabAddPrompt.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
        fabAddPrompt.classList.add('hidden');
    }
}

// 加载个人提示词
function loadPrompts() {
    const grid = document.getElementById('prompts-grid');
    const filteredPrompts = currentUser ? prompts.filter(p => p.userId === currentUser.username) : [];
    
    grid.innerHTML = '';
    
    if (filteredPrompts.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">还没有提示词，开始创建你的第一个吧！</p>
            </div>
        `;
        return;
    }
    
    filteredPrompts.forEach(prompt => {
        const card = createPromptCard(prompt);
        grid.appendChild(card);
    });
}

// 创建提示词卡片
function createPromptCard(prompt) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-2xl p-6 card-shadow cursor-pointer h-64 flex flex-col';
    
    const currentVersion = prompt.versions[prompt.currentVersion];
    
    card.innerHTML = `
        <div class="flex justify-between items-start mb-3" onclick="editPrompt('${prompt.id}')">
            <h3 class="text-lg font-semibold text-gray-800 truncate">${prompt.title}</h3>
            <div class="flex space-x-2 flex-shrink-0">
                <button class="text-gray-400 hover:text-orange-500 transition text-sm" onclick="event.stopPropagation(); editPrompt('${prompt.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-gray-400 hover:text-red-500 transition text-sm" onclick="event.stopPropagation(); deletePrompt('${prompt.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <p class="text-sm text-gray-500 mb-2">${prompt.category} · ${prompt.versions.length}个版本</p>
        
        <div class="flex items-center space-x-2 mb-3 overflow-x-auto">
            ${prompt.versions.map((v, index) => `
                <button class="px-2 py-1 ${index === prompt.currentVersion ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'} rounded-full text-xs font-medium flex-shrink-0" 
                        onclick="event.stopPropagation(); switchVersion('${prompt.id}', ${index})">
                    ${v.name}
                </button>
            `).join('')}
        </div>
        
        <div class="flex-1 min-h-0 mb-3">
            <div class="text-sm text-gray-600 overflow-hidden">
                <p class="line-clamp-3">${currentVersion.content}</p>
            </div>
        </div>
        
        <div class="flex justify-between items-center mt-auto">
            <button class="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition" onclick="event.stopPropagation(); copyContent('${currentVersion.content}')">
                <i class="fas fa-copy mr-1"></i>复制
            </button>
            <span class="text-xs text-gray-400">${new Date(prompt.updatedAt).toLocaleDateString()}</span>
        </div>
    `;
    
    // 点击卡片任意区域打开编辑面板
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            editPrompt(prompt.id);
        }
    });
    
    return card;
}

// 加载个人分类
function loadCategories() {
    const container = document.getElementById('category-filters');
    const userPrompts = prompts.filter(p => p.userId === currentUser.username);
    const uniqueCategories = [...new Set(userPrompts.map(p => p.category))];
    
    container.innerHTML = `
        <button class="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium whitespace-nowrap category-btn active" data-category="all">
            全部
        </button>
    `;
    
    uniqueCategories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium whitespace-nowrap card-shadow category-btn';
        btn.setAttribute('data-category', category);
        btn.textContent = category;
        container.appendChild(btn);
    });
}

// 加载广场提示词
function loadSquarePrompts() {
    const grid = document.getElementById('square-prompts-grid');
    const category = document.querySelector('.square-category-btn.active')?.getAttribute('data-category') || 'all';
    
    const filteredPrompts = category === 'all' 
        ? squarePrompts 
        : squarePrompts.filter(p => p.category === category);
    
    grid.innerHTML = '';
    
    filteredPrompts.forEach(prompt => {
        const currentVersion = prompt.versions[prompt.currentVersion];
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl p-6 card-shadow border-l-4 border-blue-500';
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-gray-800">${prompt.title}</h3>
                <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">广场</span>
            </div>
            
            <p class="text-sm text-gray-500 mb-4">${prompt.category}</p>
            
            <div class="text-sm text-gray-600 mb-4 line-clamp-3">
                ${currentVersion.content}
            </div>
            
            <div class="flex justify-between items-center">
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition" onclick="useSquarePrompt('${prompt.id}')">
                    <i class="fas fa-download mr-2"></i>使用模板
                </button>
                <button class="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition" onclick="copyContent('${currentVersion.content}')">
                    <i class="fas fa-copy mr-2"></i>复制
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// 加载广场分类
function loadSquareCategories() {
    const container = document.getElementById('square-category-filters');
    
    container.innerHTML = `
        <button class="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium whitespace-nowrap square-category-btn active" data-category="all">
            全部
        </button>
    `;
    
    squareCategories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium whitespace-nowrap card-shadow square-category-btn';
        btn.setAttribute('data-category', category);
        btn.textContent = category;
        container.appendChild(btn);
    });
}

// 侧滑面板控制函数
let currentEditingPrompt = null;
let currentVersionIndex = 0;

function openSidePanel(isEdit = false, promptId = null) {
    const panel = document.getElementById('side-panel');
    const overlay = document.getElementById('side-panel-overlay');
    
    currentEditingPrompt = promptId;
    
    if (isEdit && promptId) {
        const prompt = prompts.find(p => p.id === promptId);
        if (prompt) {
            currentVersionIndex = prompt.currentVersion;
            loadVersionsToPanel(prompt);
        }
    } else {
        // 新建状态
        document.getElementById('side-panel-title-input').value = '';
        document.getElementById('side-panel-category-input').value = '';
        document.getElementById('side-panel-content-input').value = '';
        loadVersionsToPanel(null);
    }
    
    panel.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // 添加统一的保存监听器 - 点击蒙层保存并关闭
    overlay.addEventListener('click', handlePanelSave);
}

function closeSidePanel() {
    const panel = document.getElementById('side-panel');
    const overlay = document.getElementById('side-panel-overlay');
    
    panel.classList.add('translate-x-full');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    
    // 移除保存监听器
    overlay.removeEventListener('click', handlePanelSave);
}

// 加载版本到面板
function loadVersionsToPanel(prompt) {
    const container = document.getElementById('side-panel-versions');
    container.innerHTML = '';
    
    if (prompt) {
        prompt.versions.forEach((version, index) => {
            const tag = document.createElement('button');
            tag.className = `px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                index === currentVersionIndex 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`;
            tag.textContent = version.name;
            tag.onclick = () => switchPanelVersion(prompt, index);
            container.appendChild(tag);
        });
        
        // 加载当前版本内容
        document.getElementById('side-panel-title-input').value = prompt.title;
        document.getElementById('side-panel-category-input').value = prompt.category;
        document.getElementById('side-panel-content-input').value = prompt.versions[currentVersionIndex].content;
    } else {
        // 新建状态
        const tag = document.createElement('span');
        tag.className = 'px-2 py-1 text-xs rounded-full bg-orange-500 text-white';
        tag.textContent = '初始版本';
        container.appendChild(tag);
        
        document.getElementById('side-panel-content-input').value = '';
    }
}

// 切换面板版本
function switchPanelVersion(prompt, index) {
    currentVersionIndex = index;
    loadVersionsToPanel(prompt);
}

// 点击外部区域保存
function handlePanelSave() {
    const title = document.getElementById('side-panel-title-input').value;
    const category = document.getElementById('side-panel-category-input').value;
    const content = document.getElementById('side-panel-content-input').value;
    
    if (!title.trim()) {
        showToast('标题不能为空');
        return;
    }
    
    if (currentEditingPrompt) {
        // 编辑现有提示词
        const prompt = prompts.find(p => p.id === currentEditingPrompt);
        if (prompt) {
            prompt.title = title;
            prompt.category = category;
            prompt.versions[currentVersionIndex].content = content;
            prompt.updatedAt = new Date().toISOString();
        }
    } else {
        // 新建提示词
        const newPrompt = {
            id: Date.now().toString(),
            title,
            category,
            userId: currentUser.username,
            versions: [{
                id: 'v1',
                name: '初始版本',
                content
            }],
            currentVersion: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        prompts.push(newPrompt);
    }
    
    storage.set('prompts', prompts);
    loadPrompts();
    loadCategories();
    
    closeSidePanel();
    showToast(currentEditingPrompt ? '已保存修改' : '已创建提示词');
}

// 为添加版本按钮绑定点击事件
function addVersion() {
    const modal = document.getElementById('add-version-modal');
    modal.classList.add('active');
    document.getElementById('add-version-name').value = '';
    document.getElementById('add-version-name').focus();
}

// 执行添加新版本
function executeAddVersion() {
    const versionName = document.getElementById('add-version-name').value.trim();
    if (!versionName) {
        showToast('请输入版本名称');
        return;
    }
    
    const prompt = prompts.find(p => p.id === currentEditingPrompt);
    if (prompt) {
        // 编辑状态下添加版本
        prompt.versions.push({
            id: `v${prompt.versions.length + 1}`,
            name: versionName,
            content: ''
        });
        
        currentVersionIndex = prompt.versions.length - 1;
        prompt.currentVersion = currentVersionIndex;
        
        loadVersionsToPanel(prompt);
        document.getElementById('side-panel-content-input').value = '';
        document.getElementById('side-panel-content-input').focus();
        
        storage.set('prompts', prompts);
        loadPrompts();
        
        // 关闭弹窗
        document.getElementById('add-version-modal').classList.remove('active');
    } else {
        // 新建状态下添加版本
        const title = document.getElementById('side-panel-title-input').value || '未命名';
        const category = document.getElementById('side-panel-category-input').value || '未分类';
        
        const newPrompt = {
            id: Date.now().toString(),
            title,
            category,
            userId: currentUser.username,
            versions: [
                { id: 'v1', name: '初始版本', content: document.getElementById('side-panel-content-input').value },
                { id: 'v2', name: versionName, content: '' }
            ],
            currentVersion: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        prompts.push(newPrompt);
        currentEditingPrompt = newPrompt.id;
        currentVersionIndex = 1;
        
        loadVersionsToPanel(newPrompt);
        document.getElementById('side-panel-content-input').value = '';
        document.getElementById('side-panel-content-input').focus();
        
        storage.set('prompts', prompts);
        loadPrompts();
        
        // 关闭弹窗
        document.getElementById('add-version-modal').classList.remove('active');
    }
}

function closeSidePanel() {
    const panel = document.getElementById('side-panel');
    const overlay = document.getElementById('side-panel-overlay');
    
    panel.classList.add('translate-x-full');
    overlay.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    
    // 重置表单
    editingPromptId = null;
}

// 旧的showPromptModal函数被替换
function showPromptModal(promptId = null) {
    openSidePanel(!!promptId, promptId);
}

function editPrompt(promptId) {
    openSidePanel(true, promptId);
}

// 保存提示词
function savePrompt(event) {
    event.preventDefault();
    
    const title = document.getElementById('side-panel-title-input').value;
    const category = document.getElementById('side-panel-category-input').value;
    const content = document.getElementById('side-panel-content-input').value;
    
    if (editingPromptId) {
        // 编辑现有提示词
        const prompt = prompts.find(p => p.id === editingPromptId);
        if (prompt) {
            prompt.title = title;
            prompt.category = category;
            prompt.versions[prompt.currentVersion].content = content;
            prompt.updatedAt = new Date().toISOString();
        }
    } else {
        // 添加新提示词
        const newPrompt = {
            id: Date.now().toString(),
            title,
            category,
            userId: currentUser.username,
            versions: [{
                id: 'v1',
                name: '初始版本',
                content
            }],
            currentVersion: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        prompts.push(newPrompt);
    }
    
    storage.set('prompts', prompts);
    loadPrompts();
    loadCategories();
    
    closeSidePanel();
    showToast(editingPromptId ? '更新成功！' : '添加成功！');
}

// 删除提示词
function deletePrompt(promptId) {
    if (confirm('确定要删除这个提示词吗？此操作不可恢复。')) {
        prompts = prompts.filter(p => p.id !== promptId);
        storage.set('prompts', prompts);
        loadPrompts();
        loadCategories();
        showToast('删除成功！');
    }
}

// 切换版本
function switchVersion(promptId, versionIndex) {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
        prompt.currentVersion = versionIndex;
        storage.set('prompts', prompts);
        loadPrompts();
    }
}

// 管理版本
function manageVersions(promptId) {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    editingPromptId = promptId;
    currentPromptVersions = prompt;
    
    const modal = document.getElementById('version-modal');
    const versionList = document.getElementById('version-list');
    
    versionList.innerHTML = '';
    
    prompt.versions.forEach((version, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
        item.innerHTML = `
            <div>
                <span class="font-medium">${version.name}</span>
                ${index === prompt.currentVersion ? '<span class="text-orange-500 text-sm ml-2">当前</span>' : ''}
            </div>
            <div class="flex space-x-2">
                ${prompt.versions.length > 1 ? `<button class="text-red-500 hover:text-red-600" onclick="deleteVersion('${promptId}', ${index})">
                    <i class="fas fa-times"></i>
                </button>` : ''}
            </div>
        `;
        versionList.appendChild(item);
    });
    
    modal.classList.add('active');
}

// 添加新版本
function addVersion() {
    const name = document.getElementById('new-version-name').value;
    const content = document.getElementById('new-version-content').value;
    
    if (!name || !content) {
        showToast('请填写版本名称和内容');
        return;
    }
    
    const prompt = prompts.find(p => p.id === editingPromptId);
    if (prompt) {
        prompt.versions.push({
            id: `v${prompt.versions.length + 1}`,
            name,
            content
        });
        storage.set('prompts', prompts);
        loadPrompts();
        
        // 清空表单并刷新版本列表
        document.getElementById('new-version-name').value = '';
        document.getElementById('new-version-content').value = '';
        manageVersions(editingPromptId);
        
        showToast('版本添加成功！');
    }
}

// 删除版本
function deleteVersion(promptId, versionIndex) {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt && prompt.versions.length > 1) {
        prompt.versions.splice(versionIndex, 1);
        
        // 确保currentVersion有效
        if (prompt.currentVersion >= prompt.versions.length) {
            prompt.currentVersion = prompt.versions.length - 1;
        }
        
        storage.set('prompts', prompts);
        loadPrompts();
        manageVersions(promptId);
        showToast('版本删除成功！');
    }
}

// 使用广场提示词
function useSquarePrompt(squarePromptId) {
    if (!currentUser) {
        showToast('请先登录！');
        return;
    }
    
    const squarePrompt = squarePrompts.find(p => p.id === squarePromptId);
    if (!squarePrompt) return;
    
    const newPrompt = {
        id: Date.now().toString(),
        title: squarePrompt.title,
        category: squarePrompt.category,
        userId: currentUser.username,
        versions: [{
            id: 'v1',
            name: '初始版本',
            content: squarePrompt.versions[squarePrompt.currentVersion].content
        }],
        currentVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    prompts.push(newPrompt);
    storage.set('prompts', prompts);
    loadPrompts();
    loadCategories();
    showToast('已添加到你的工作台！');
}

// 复制内容
function copyContent(content) {
    navigator.clipboard.writeText(content).then(() => {
        showToast('内容已复制到剪贴板！');
    }).catch(() => {
        showToast('复制失败，请手动复制');
    });
}

// 飞书导入
function importFromFeishu() {
    // 模拟飞书导入功能
    const feishuData = [
        { title: 'AI写作助手', category: '内容创作', content: '请帮我写一篇关于人工智能的文章...' },
        { title: '代码优化建议', category: '代码开发', content: '请检查以下代码并提供优化建议...' }
    ];
    
    feishuData.forEach(item => {
        const newPrompt = {
            id: Date.now().toString() + Math.random(),
            title: item.title,
            category: item.category,
            userId: currentUser.username,
            versions: [{
                id: 'v1',
                name: '初始版本',
                content: item.content
            }],
            currentVersion: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        prompts.push(newPrompt);
    });
    
    storage.set('prompts', prompts);
    loadPrompts();
    loadCategories();
    showToast('飞书数据导入成功！');
}

// 分类筛选
function filterByCategory(category) {
    const cards = document.querySelectorAll('#prompts-grid > div');
    const filteredPrompts = category === 'all' 
        ? prompts.filter(p => p.userId === currentUser.username)
        : prompts.filter(p => p.userId === currentUser.username && p.category === category);
    
    const grid = document.getElementById('prompts-grid');
    grid.innerHTML = '';
    
    if (filteredPrompts.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 text-lg">该分类下暂无提示词</p>
            </div>
        `;
        return;
    }
    
    filteredPrompts.forEach(prompt => {
        const card = createPromptCard(prompt);
        grid.appendChild(card);
    });
}

// 广场分类筛选
function filterSquareByCategory(category) {
    loadSquarePrompts();
}

// 显示Toast提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 加载管理员数据
function loadAdminData() {
    // 加载广场提示词管理
    const adminSquare = document.getElementById('admin-square-prompts');
    adminSquare.innerHTML = '';
    
    squarePrompts.forEach(prompt => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-3 bg-gray-50 rounded mb-2';
        item.innerHTML = `
            <div>
                <span class="font-medium">${prompt.title}</span>
                <span class="text-sm text-gray-500 ml-2">(${prompt.category})</span>
            </div>
            <div class="flex space-x-2">
                <button class="text-blue-500 hover:text-blue-600" onclick="editSquarePrompt('${prompt.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-600" onclick="deleteSquarePrompt('${prompt.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        adminSquare.appendChild(item);
    });
    
    // 加载分类管理
    const adminCategories = document.getElementById('admin-categories');
    adminCategories.innerHTML = '';
    
    squareCategories.forEach((category, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-3 bg-gray-50 rounded';
        item.innerHTML = `
            <span>${category}</span>
            <button class="text-red-500 hover:text-red-600" onclick="deleteSquareCategory(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        adminCategories.appendChild(item);
    });
}

// 事件绑定
function bindEvents() {
    // 导航事件
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // 设置图标点击
    document.querySelector('[data-page="settings"]').addEventListener('click', (e) => {
        e.preventDefault();
        showPage('settings');
    });
    
    // 认证表单
    document.getElementById('auth-form').addEventListener('submit', handleAuth);
    document.getElementById('auth-switch').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });
    
    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // 浮动操作按钮
    document.getElementById('fab-add-prompt').addEventListener('click', () => openSidePanel(false));
    
    // 侧滑面板关闭
    document.getElementById('side-panel-overlay').addEventListener('click', closeSidePanel);
    document.getElementById('side-panel-save').addEventListener('click', handlePanelSave);
    
    // 版本管理
    document.getElementById('add-version-btn').addEventListener('click', addVersion);
    
    // 添加版本弹窗
    document.getElementById('confirm-add-version').addEventListener('click', executeAddVersion);
    document.getElementById('cancel-add-version').addEventListener('click', () => {
        document.getElementById('add-version-modal').classList.remove('active');
    });
    
    // 版本管理弹窗
    document.getElementById('close-version-modal').addEventListener('click', () => {
        document.getElementById('version-modal').classList.remove('active');
    });
    
    // 飞书导入
    document.getElementById('import-flybook').addEventListener('click', importFromFeishu);
    
    // 分类筛选
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn')) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('bg-orange-500', 'text-white'));
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.add('bg-white', 'text-gray-700'));
            e.target.classList.remove('bg-white', 'text-gray-700');
            e.target.classList.add('bg-orange-500', 'text-white');
            
            const category = e.target.getAttribute('data-category');
            filterByCategory(category);
        }
        
        if (e.target.classList.contains('square-category-btn')) {
            document.querySelectorAll('.square-category-btn').forEach(btn => btn.classList.remove('bg-orange-500', 'text-white'));
            document.querySelectorAll('.square-category-btn').forEach(btn => btn.classList.add('bg-white', 'text-gray-700'));
            e.target.classList.remove('bg-white', 'text-gray-700');
            e.target.classList.add('bg-orange-500', 'text-white');
            
            const category = e.target.getAttribute('data-category');
            filterSquareByCategory(category);
        }
    });
}

// 初始化应用
initApp();

// 默认创建管理员账户（仅用于演示）
if (!storage.get('users')) {
    storage.set('users', {
        'admin': { password: 'admin123', isAdmin: true },
        'user': { password: 'user123' }
    });
}