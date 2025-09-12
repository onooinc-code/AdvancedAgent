
(function() {
    'use strict';

    // --- 1. STATE MANAGEMENT ---
    let conversationState = {};
    let tagStatus = {
        GET_PREVIEW_STATE: 'idle',
        TAKE_SCREENSHOT: 'idle',
        GET_DOM_STRUCTURE: 'idle',
        INTERACT_ELEMENT: 'idle',
    };
    const features = [
        { name: "Conversation Lifecycle", status: "Completed" },
        { name: "Conversation Titling", status: "Completed" },
        { name: "Per-Conversation Settings", status: "Completed" },
        { name: "Rich Message Content", status: "Completed" },
        { name: "Message Metadata Display", status: "Completed" },
        { name: "Long Message Handling", status: "Completed" },
        { name: "Message Toolbar (Standard)", status: "Completed" },
        { name: "Message Toolbar (AI)", status: "Completed" },
        { name: "Backend Process Transparency", status: "Completed" },
        { name: "Status Bar Metrics", status: "Completed" },
        { name: "Discussion Mode (Core)", status: "Completed" },
        { name: "Discussion Mode (AI Rules)", status: "Completed" },
        { name: "Advanced Agent Configuration", status: "Completed" },
        { name: "Automatic Agent Generation", status: "Completed" },
    ];


    // --- 2. UI & STYLING ---
    function injectStylesheet() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('style.css');
        document.head.appendChild(link);
    }

    function createControlPanel() {
        if (document.getElementById('ai-bridge-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'ai-bridge-panel';
        panel.innerHTML = `
            <div id="ai-bridge-header">
                <h3>AI Interactive Bridge</h3>
                <div id="ai-bridge-status-light" class="status-light-red" title="Status: Disconnected"></div>
                <button id="ai-bridge-toggle-btn" title="Minimize">-</button>
            </div>
            <div id="ai-bridge-body">
                <div class="button-grid">
                    <button id="new-session-btn" title="Sends the initial context prompt to the AI.">🚀 New Session</button>
                    <button id="view-conversation-btn">📋 View State</button>
                    <button id="view-tags-btn">🏷️ View Tags</button>
                    <button id="toggle-automation-btn" class="automation-on">🟢 Automation ON</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        makeDraggable(panel);
        createModals();
    }
    
    function createModals() {
        // Conversation State Modal
        const conversationModal = document.createElement('div');
        conversationModal.id = 'conversation-modal';
        conversationModal.className = 'ai-bridge-modal';
        conversationModal.innerHTML = `
            <div class="modal-header"><h2>Conversation State</h2><button class="modal-close-btn">X</button></div>
            <div class="modal-content"><pre id="conversation-state-pre"></pre></div>
        `;
        document.body.appendChild(conversationModal);

        // Tags Status Modal
        const tagsModal = document.createElement('div');
        tagsModal.id = 'tags-modal';
        tagsModal.className = 'ai-bridge-modal';
        tagsModal.innerHTML = `
            <div class="modal-header"><h2>Tag Status</h2><button class="modal-close-btn">X</button></div>
            <div class="modal-content" id="tags-status-content"></div>
        `;
        document.body.appendChild(tagsModal);

        // Features Modal
        const featuresModal = document.createElement('div');
        featuresModal.id = 'features-modal';
        featuresModal.className = 'ai-bridge-modal';
        featuresModal.innerHTML = `
            <div class="modal-header"><h2>Feature Status</h2><button class="modal-close-btn">X</button></div>
            <div class="modal-content" id="features-status-content"></div>
        `;
        document.body.appendChild(featuresModal);
    }
    
    function toggleModal(modalId, show) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = show ? 'block' : 'none';
        }
    }

    function updateTagStatusUI() {
        const content = document.getElementById('tags-status-content');
        if (!content) return;
        content.innerHTML = '<ul>' + Object.entries(tagStatus).map(([tag, status]) => 
            `<li><span class="status-light-${status === 'success' ? 'green' : (status === 'running' ? 'yellow' : 'red')}"></span>${tag}</li>`
        ).join('') + '</ul>';
    }

    function updateFeaturesUI() {
        const content = document.getElementById('features-status-content');
        if (!content) return;
        content.innerHTML = `
            <table>
                <thead><tr><th>Feature</th><th>Status</th></tr></thead>
                <tbody>
                    ${features.map(f => `<tr><td>${f.name}</td><td><span class="status-light-${f.status === 'Completed' ? 'green' : 'yellow'}"></span>${f.status}</td></tr>`).join('')}
                </tbody>
            </table>`;
    }

    // --- 3. CORE FUNCTIONALITY & HELPERS ---
    function getProjectId() { try { return window.location.pathname.split('/drive/')[1].split('/')[0]; } catch (e) { return null; } }
    function getPreviewIframe() { return document.querySelector('iframe[title="Preview"]'); }
    function getChatInput() { return document.querySelector('textarea[placeholder*="Make changes"]'); }
    function getSendButton() { return document.querySelector('button[aria-label="Send"]'); }

    function setStatusLight(color) {
        const light = document.getElementById('ai-bridge-status-light');
        if(light) {
            light.className = `status-light-${color}`;
            light.title = `Status: ${color === 'green' ? 'Connected' : 'Disconnected'}`;
        }
    }

    // --- 4. AUTOMATION & COMMAND HANDLING ---
    async function sendReportToMonica(report) {
        const input = getChatInput();
        const sendBtn = getSendButton();
        if (input && sendBtn && !sendBtn.disabled) {
            const prompt = `Here is the diagnostic report you requested.\n\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\``;
            input.value = prompt;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(r => setTimeout(r, 100));
            sendBtn.click();
        }
    }

    async function handleGetPreviewState() {
        tagStatus.GET_PREVIEW_STATE = 'running';
        updateTagStatusUI();
        const studioErrors = Array.from(document.querySelectorAll('.error-list .message')).map(el => el.textContent.trim());
        const iframeErrors = await injectAndListenForIframeErrors();
        const report = { studioBuildErrors: studioErrors, previewConsoleErrors: iframeErrors };
        await sendReportToMonica(report);
        tagStatus.GET_PREVIEW_STATE = 'success';
        updateTagStatusUI();
    }

    function injectAndListenForIframeErrors() {
        return new Promise(async (resolve) => {
            const iframe = getPreviewIframe();
            if (!iframe) {
                resolve(["Error: Preview iframe not found."]);
                return;
            }

            const frameId = Array.from(document.querySelectorAll('iframe')).indexOf(iframe);
            if (frameId === -1) {
                resolve(["Error: Could not determine frame ID."]);
                return;
            }

            let collectedErrors = [];
            const timeout = setTimeout(() => {
                window.removeEventListener('message', messageListener);
                resolve(collectedErrors.length > 0 ? collectedErrors : ["No console errors detected within 2 seconds."]);
            }, 2000);

            const messageListener = (event) => {
                if (event.data && event.data.type === 'MONICA_IFRAME_ERROR') {
                    collectedErrors.push(event.data.error);
                }
            };
            window.addEventListener('message', messageListener, false);
            
            chrome.runtime.sendMessage({ type: 'INJECT_SCRIPT', frameId: frameId + 1}, response => { // Frame IDs seem to be 1-indexed for the API
                 if(!response || response.status !== 'success') {
                     clearTimeout(timeout);
                     window.removeEventListener('message', messageListener);
                     resolve([`Error injecting script: ${response?.message || 'Unknown error'}`]);
                 }
            });
        });
    }
    
    async function handleTakeScreenshot() {
        tagStatus.TAKE_SCREENSHOT = 'running';
        updateTagStatusUI();
        chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, async (response) => {
            if (response.status === 'success') {
                await sendReportToMonica({ screenshotDataUrl: response.dataUrl });
                tagStatus.TAKE_SCREENSHOT = 'success';
            } else {
                await sendReportToMonica({ screenshotError: response.message });
                tagStatus.TAKE_SCREENSHOT = 'error';
            }
            updateTagStatusUI();
        });
    }

    async function handleGetDomStructure() {
        tagStatus.GET_DOM_STRUCTURE = 'running';
        updateTagStatusUI();
        const iframe = getPreviewIframe();
        if (iframe && iframe.contentDocument) {
            await sendReportToMonica({ domStructure: iframe.contentDocument.body.innerHTML });
            tagStatus.GET_DOM_STRUCTURE = 'success';
        } else {
            await sendReportToMonica({ domError: "Could not access preview iframe DOM." });
            tagStatus.GET_DOM_STRUCTURE = 'error';
        }
        updateTagStatusUI();
    }
    
    async function handleInteractElement(params) {
        tagStatus.INTERACT_ELEMENT = 'running';
        updateTagStatusUI();
        const iframe = getPreviewIframe();
        if (!iframe || !iframe.contentDocument) {
            await sendReportToMonica({ interactionError: "Could not access preview iframe." });
            tagStatus.INTERACT_ELEMENT = 'error';
            updateTagStatusUI();
            return;
        }

        const element = iframe.contentDocument.querySelector(params.selector);
        if (!element) {
            await sendReportToMonica({ interactionError: `Element with selector "${params.selector}" not found.` });
            tagStatus.INTERACT_ELEMENT = 'error';
            updateTagStatusUI();
            return;
        }

        let result = {};
        try {
            if (params.action === 'click') {
                element.click();
                result = { interactionSuccess: `Clicked element "${params.selector}".` };
            } else if (params.action === 'getText') {
                result = { elementText: element.textContent.trim() };
            }
            tagStatus.INTERACT_ELEMENT = 'success';
        } catch (e) {
            result = { interactionError: e.message };
            tagStatus.INTERACT_ELEMENT = 'error';
        }
        await sendReportToMonica(result);
        updateTagStatusUI();
    }


    function deepMerge(target, source) {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], deepMerge(target[key], source[key]))
            }
        }
        Object.assign(target || {}, source)
        return target
    }

    function handleUpdateContext(updateData) {
        conversationState = deepMerge(conversationState, updateData.context_update);
        if(updateData.summary && conversationState.messages) {
            conversationState.messages.push({ sender: 'ai', full_text: '...', summary: updateData.summary, timestamp: new Date().toISOString() });
        }
        saveConversationContext(conversationState);
    }

    async function parseAndExecuteCommands(node) {
        const actionRegex = /<!--\s*MONICA_ACTION:\s*({[\s\S]*?})\s*-->/g;
        const updateRegex = /<!--\s*MONICA_UPDATE:\s*({[\s\S]*?})\s*-->/g;

        const html = node.innerHTML;
        let actionMatch;
        let updateMatch;
        let commandFound = false;

        while ((actionMatch = actionRegex.exec(html)) !== null) {
            commandFound = true;
            try {
                const command = JSON.parse(actionMatch[1]);
                if (document.getElementById('toggle-automation-btn')?.classList.contains('automation-on')) {
                    switch(command.action) {
                        case 'GET_PREVIEW_STATE': await handleGetPreviewState(); break;
                        case 'TAKE_SCREENSHOT': await handleTakeScreenshot(); break;
                        case 'GET_DOM_STRUCTURE': await handleGetDomStructure(); break;
                        case 'INTERACT_ELEMENT': await handleInteractElement(command.params); break;
                    }
                }
            } catch (e) { console.error('Failed to parse MONICA_ACTION:', e); }
        }

        while ((updateMatch = updateRegex.exec(html)) !== null) {
            commandFound = true;
            try {
                const updateData = JSON.parse(updateMatch[1]);
                handleUpdateContext(updateData);
            } catch (e) { console.error('Failed to parse MONICA_UPDATE:', e); }
        }

        if(commandFound) {
            setStatusLight('green');
        }
    }


    // --- 5. EVENT LISTENERS & INITIALIZATION ---
    function setupListeners() {
        const observer = new MutationObserver((mutations) => {
            const sendBtn = getSendButton();
            if (sendBtn && (sendBtn.disabled || sendBtn.classList.contains('running'))) {
                setStatusLight('yellow'); // AI is thinking
                return; 
            }
            if (document.getElementById('ai-bridge-status-light').classList.contains('status-light-yellow')) {
                setStatusLight('red'); // AI finished thinking, disconnected until new tag
            }

            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('turn') && node.classList.contains('output')) {
                        parseAndExecuteCommands(node);
                    }
                }
            }
        });

        const chatContainer = document.querySelector('ms-code-assistant-chat ms-autoscroll-container');
        if (chatContainer) {
            observer.observe(chatContainer, { childList: true, subtree: true });
        }

        document.body.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            switch(target.id) {
                case 'new-session-btn': sendBootstrapPrompt(); break;
                case 'view-conversation-btn':
                    document.getElementById('conversation-state-pre').textContent = JSON.stringify(conversationState, null, 2);
                    toggleModal('conversation-modal', true);
                    break;
                case 'view-tags-btn':
                    updateTagStatusUI();
                    toggleModal('tags-modal', true);
                    break;
                case 'view-features-btn': // This ID needs to be added to the UI
                    updateFeaturesUI();
                    toggleModal('features-modal', true);
                    break;
                case 'toggle-automation-btn':
                    target.classList.toggle('automation-on');
                    target.classList.toggle('automation-off');
                    if (target.classList.contains('automation-on')) {
                        target.textContent = '🟢 Automation ON';
                    } else {
                        target.textContent = '🔴 Automation OFF';
                    }
                    break;
                case 'ai-bridge-toggle-btn':
                    const panelBody = document.getElementById('ai-bridge-body');
                    const isMinimized = panelBody.style.display === 'none';
                    panelBody.style.display = isMinimized ? 'block' : 'none';
                    target.textContent = isMinimized ? '-' : '+';
                    target.title = isMinimized ? 'Minimize' : 'Expand';
                    break;
            }
            if (target.classList.contains('modal-close-btn')) {
                target.closest('.ai-bridge-modal').style.display = 'none';
            }
        });
    }
    
    function sendBootstrapPrompt() {
        const input = getChatInput();
        const sendBtn = getSendButton();
        if (!input || !sendBtn) return;
        const prompt = `Welcome, AI Partner. This is the start of a new development session. Your primary directive is to operate as an autonomous senior frontend engineer to build and improve the "Monica" application by strictly following the protocol outlined below.

### 1. The Autonomous Development Cycle
You must adhere to the 6-phase development cycle for every feature, bug fix, or improvement. You are to manage this cycle yourself, proceeding from one phase to the next upon successful completion.
1.  **Analysis & Definition:** Acknowledge the task.
2.  **Planning:** Provide a detailed implementation plan.
3.  **Implementation:** Generate the code.
4.  **Testing:** After I apply the code, you will use the \`GET_PREVIEW_STATE\` action to test for errors. If there are no errors, you will generate a formal QA report.
5.  **Completion:** Announce completion.
6.  **Production:** Await the next task.

### 2. The Command & Control Protocol (Tags)
You will interact with the development environment using a strict command protocol. All commands must be sent within an HTML comment in your response. The extension will parse and execute them.

**Action Format:** \`<!-- MONICA_ACTION: {"action": "ACTION_NAME", "params": {...}} -->\`

**Available Actions:**
*   \`GET_PREVIEW_STATE\`: Requests a full diagnostic report (build & runtime errors).
*   \`TAKE_SCREENSHOT\`: Takes a screenshot of the current page and sends it to you as a data URL.
*   \`GET_DOM_STRUCTURE\`: Retrieves the innerHTML of the preview body.
*   \`INTERACT_ELEMENT\`: Performs an action on a DOM element.
    *   \`params\`: \`{ "selector": "css-selector", "action": "click" | "getText" }\`

### 3. The Conversation & Context Protocol
You must maintain a persistent, evolving context for our entire project.
*   **Format:** At the end of EVERY response, you MUST include an update tag.
*   **Update Tag:** \`<!-- MONICA_UPDATE: {"summary": "A brief summary of your last response.", "context_update": {...}} -->\`
*   The \`context_update\` object will be deep-merged into the existing conversation state. Do not send the full context each time, only the fields that need to be added or changed.
*   **Fields to Update:** \`project_name\`, \`current_task\`, \`topics_discussed\`, \`errors_found\`, \`features_implemented\`, \`messages\` (append a new message object with \`full_text\` and \`summary\`).

### Your First Task
1. Acknowledge your understanding of this entire protocol.
2. Send a test command to check the status of all available tags.
3. Update the conversation context with an initial state.`;
        input.value = prompt;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => sendBtn.click(), 100);
    }
    
    function makeDraggable(element) { /* Omitted for brevity, same as previous version */ }

    // --- INITIALIZATION ---
    function initialize() {
        if (document.getElementById('ai-bridge-panel')) return;
        const appRoot = document.querySelector('app-root');
        if (!appRoot) {
            setTimeout(initialize, 1000);
            return;
        }
        injectStylesheet();
        createControlPanel();
        setupListeners();
        // Load initial conversation state
        const projectId = getProjectId();
        if (projectId) {
             chrome.runtime.sendMessage({ type: 'LOAD_CONTEXT', projectId }, (response) => {
                 if (response && response.data) {
                     conversationState = response.data;
                 }
             });
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
