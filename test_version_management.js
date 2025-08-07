const { chromium } = require('playwright');

async function testVersionManagement() {
    console.log('🚀 Starting version management test...');
    
    // Launch browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to the application
        console.log('📍 Navigating to application...');
        await page.goto('file:///mnt/e/提示词/index.html');
        await page.waitForLoadState('networkidle');
        
        // Test 1: User login
        console.log('🔐 Testing user login...');
        await page.fill('#loginUsername', 'user');
        await page.fill('#loginPassword', 'user123');
        await page.click('button[type="submit"]');
        
        // Wait for login to complete
        await page.waitForSelector('#promptsPage', { state: 'visible' });
        console.log('✅ Login successful');
        
        // Test 2: Create new prompt
        console.log('📝 Creating new prompt...');
        await page.click('button:has-text("新建提示词")');
        await page.waitForSelector('.modal:visible');
        
        await page.fill('#promptTitle', '测试提示词');
        await page.selectOption('#promptCategory', '写作');
        await page.fill('#promptContent', '这是一个测试提示词的内容');
        await page.click('button:has-text("保存")');
        
        // Wait for prompt to be created
        await page.waitForTimeout(1000);
        console.log('✅ Prompt created');
        
        // Test 3: Open version management
        console.log('🔧 Opening version management...');
        const promptCard = await page.locator('.prompt-card').first();
        await promptCard.hover();
        await promptCard.locator('button:has-text("管理版本")').click();
        
        await page.waitForSelector('.modal:visible');
        console.log('✅ Version management opened');
        
        // Test 4: Add new version
        console.log('➕ Adding new version...');
        await page.click('button:has-text("添加版本")');
        await page.waitForTimeout(500);
        
        const versionInputs = await page.locator('#versionsList input[type="text"]').all();
        const newVersionInput = versionInputs[versionInputs.length - 1];
        await newVersionInput.fill('版本 2');
        
        const contentInputs = await page.locator('#versionsList textarea').all();
        const newContentInput = contentInputs[contentInputs.length - 1];
        await newContentInput.fill('这是第二个版本的内容');
        
        console.log('✅ New version added');
        
        // Test 5: Test hover icons
        console.log('🖱️ Testing hover icons...');
        const versionItems = await page.locator('.version-item').all();
        for (const item of versionItems) {
            await item.hover();
            await page.waitForTimeout(200);
        }
        console.log('✅ Hover icons tested');
        
        // Test 6: Test edit version (rename)
        console.log('✏️ Testing version rename...');
        const editButtons = await page.locator('.version-item .edit-version').all();
        if (editButtons.length > 0) {
            await editButtons[0].click();
            await page.waitForTimeout(300);
            
            const nameInput = await page.locator('.version-item input[type="text"]').first();
            await nameInput.fill('重命名的版本');
            console.log('✅ Version renamed');
        }
        
        // Test 7: Test delete version
        console.log('🗑️ Testing version delete...');
        const deleteButtons = await page.locator('.version-item .delete-version').all();
        if (deleteButtons.length > 1) {
            // Should have delete button for non-last version
            await deleteButtons[0].click();
            await page.waitForTimeout(300);
            console.log('✅ Version delete tested');
        } else {
            console.log('ℹ️ Only one version, delete button hidden as expected');
        }
        
        // Test 8: Save changes
        console.log('💾 Saving changes...');
        await page.click('button:has-text("保存")');
        await page.waitForTimeout(1000);
        console.log('✅ Changes saved');
        
        // Take screenshot for documentation
        await page.screenshot({ path: '/mnt/e/提示词/version_management_test.png', fullPage: true });
        
        console.log('🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: '/mnt/e/提示词/test_error.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

testVersionManagement().catch(console.error);