
(function() {
    'use strict';

    // --- 1. CONFIGURATION & STATE ---
    let isAutomationActive = false;
    let automationCooldown = false;

    // Load initial automation state from background script
    chrome.runtime.sendMessage({ type: 'GET_AUTOMATION_STATE' }, (response) => {
        isAutomationActive = response.isAutomationActive || false;
        if (document.getElementById('ai-bridge-panel')) {
            updateAutomationStatus();
        }
    });


    // --- 2. UI & STYLING ---
    function createControlPanel() {
        const styles = `
            #ai-bridge-panel {
                position: fixed; bottom: 20px; left: 20px; z-index: 10001; background-color: rgba(28, 24, 44, 0.9);
                backdrop-filter: blur(10px); border: 1px solid #3a3252; border-radius: 12px; padding: 15px;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); color: #e0e0e0; font-family: 'Roboto Mono', monospace;
                width: 380px; cursor: move; user-select: none; transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            #ai-bridge-panel.minimized { transform: translateX(-360px); }
            #ai-bridge-panel:not(.minimized):hover { box-shadow: 0 8px 40px rgba(164, 80, 232, 0.3); }
            #ai-bridge-panel h3 { margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid #3a3252; font-size: 16px; color: #a450e8; text-align: center; }
            #ai-bridge-panel .button-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            #ai-bridge-panel button {
                background-color: #a450e8; color: white; border: none; border-radius: 8px; padding: 10px;
                font-family: 'Cairo', sans-serif; font-size: 14px; cursor: pointer; transition: all 0.2s ease;
                display: flex; align-items: center; justify-content: center; gap: 8px;
            }
            #ai-bridge-panel button:hover { background-color: #8e44ad; box-shadow: 0 0 15px rgba(164, 80, 232, 0.5); }
            #ai-bridge-log { margin-top: 15px; height: 100px; background-color: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 10px; font-size: 12px; overflow-y: auto; border: 1px solid #3a3252; white-space: pre-wrap; word-wrap: break-word; }
            .log-success { color: #4caf50; } .log-info { color: #00bcd4; } .log-error { color: #f44336; } .log-command { color: #facc15; } .log-auto { color: #f59e0b; }
            #ai-bridge-toggle { position: absolute; top: 50%; right: -20px; transform: translateY(-50%); width: 20px; height: 50px; background-color: #a450e8; border-top-right-radius: 8px; border-bottom-right-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; }
            .automation-toggle { display: flex; align-items: center; justify-between; padding: 10px; background-color: rgba(0,0,0,0.2); border-radius: 8px; margin-bottom: 15px; }
            .automation-status { display: flex; align-items: center; gap: 8px; font-weight: bold; }
            .status-light { width: 12px; height: 12px; border-radius: 50%; background-color: #ef4444; transition: background-color 0.3s; }
            .status-light.active { background-color: #4ade80; box-shadow: 0 0 8px #4ade80; }
            .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: .4s; border-radius: 28px; }
            .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
            input:checked + .slider { background-color: #8b5cf6; }
            input:checked + .slider:before { transform: translateX(22px); }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const panel = document.createElement('div');
        panel.id = 'ai-bridge-panel';
        panel.innerHTML = `
            <h3>AI Interactive Bridge v1.0</h3>
            <div class="automation-toggle">
                <div class="automation-status">
                    <div id="automation-status-light" class="status-light"></div>
                    <span>Full Automation</span>
                </div>
                <label class="switch">
                    <input type="checkbox" id="automation-checkbox">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="button-grid">
                 <button id="new-talk-btn">🚀 Start New Talk</button>
                 <button id="copy-preview-html-btn">📋 Copy Preview HTML</button>
            </div>
            <div id="ai-bridge-log"><div class="log-info">[${new Date().toLocaleTimeString()}] Bridge Extension loaded. Waiting...</div></div>
            <div id="ai-bridge-toggle">&lt;</div>
        `;
        
        document.body.appendChild(panel);
        makeDraggable(panel);
        updateAutomationStatus();
    }

    function log(message, type = 'info') { /* ... same as before ... */ }
    function updateAutomationStatus() { /* ... same as before ... */ }

    // --- 3. CORE FUNCTIONALITY & HELPERS ---
    function getProjectId() { /* ... same as before ... */ }
    function getPreviewIframe() { /* ... same as before ... */ }
    function getChatInput() { /* ... same as before ... */ }
    function getSendButton() { /* ... same as before ... */ }

    function saveConversationContext(data) {
        const projectId = getProjectId();
        chrome.runtime.sendMessage({ type: 'SAVE_CONTEXT', data, projectId }, (response) => {
            if (response && response.status === 'success') {
                log('Conversation context saved.', 'success');
            } else {
                log('Failed to save context.', 'error');
            }
        });
    }

    function loadConversationContext(callback) {
        const projectId = getProjectId();
        chrome.runtime.sendMessage({ type: 'LOAD_CONTEXT', projectId }, (response) => {
            if (response) {
                callback(response.data);
            }
        });
    }

    function parseAndExecuteCommands(html) {
        // NOTE: executeCommand is removed as we don't need it for now.
        const contextRegex = /<!--\s*MONICA_CONTEXT_DATA:\s*({[\s\S]*?})\s*-->/g;
        const match = contextRegex.exec(html);
        if (match) {
            try {
                saveConversationContext(JSON.parse(match[1]));
            } catch(e) { log(`Failed to parse context data: ${e.message}`, 'error'); }
        }
    }

    // --- 4. AUTOMATION & EVENT LISTENERS ---
    function handleAutoSendError() { /* ... same as before ... */ }

    function handleNewTalk() {
        loadConversationContext((contextData) => {
            if (!contextData) {
                alert('No saved conversation context found for this project.');
                return;
            }
            const input = getChatInput();
            const sendBtn = getSendButton();
            if (!input || !sendBtn) {
                alert('Could not find chat input or send button.');
                return;
            }
            const prompt = `
[CONVERSATION RE-INITIALIZATION]
This is a new session. Please use the following context to get up to speed on our previous conversation.

--- CUMULATIVE CONTEXT ---
${contextData.cumulativeContext}

--- LAST TURN SUMMARY ---
${contextData.turnSummary}
            `;
            input.value = prompt;
            sendBtn.click();
            log('Re-initialization prompt sent.', 'success');
        });
    }

    function setupListeners() {
        const chatObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('turn') && node.classList.contains('output')) {
                             parseAndExecuteCommands(node.innerHTML);
                        }
                    });
                }
            });
        });
        const chatContainer = document.querySelector('ms-autoscroll-container');
        if (chatContainer) chatObserver.observe(chatContainer, { childList: true, subtree: true });

        document.body.addEventListener('click', (e) => {
            const target = e.target;
            if (target.id === 'copy-preview-html-btn') {
                 const iframe = getPreviewIframe();
                 if (iframe && iframe.contentDocument) {
                     navigator.clipboard.writeText(iframe.contentDocument.documentElement.outerHTML)
                        .then(() => log('Preview HTML copied!', 'success'));
                 }
            } else if (target.id === 'new-talk-btn') { handleNewTalk(); }
        });

        const checkbox = document.getElementById('automation-checkbox');
        if (checkbox) checkbox.addEventListener('change', (e) => {
            isAutomationActive = e.target.checked;
            chrome.runtime.sendMessage({ type: 'SET_AUTOMATION_STATE', isAutomationActive }, () => {
                updateAutomationStatus();
                log(`Full Automation ${isAutomationActive ? 'ENABLED' : 'DISABLED'}.`, 'auto');
            });
        });

        const toggleButton = document.getElementById('ai-bridge-toggle');
        if (toggleButton) {
            toggleButton.onclick = (e) => {
                e.stopPropagation();
                const panel = document.getElementById('ai-bridge-panel');
                panel.classList.toggle('minimized');
                toggleButton.textContent = panel.classList.contains('minimized') ? '>' : '<';
            };
        }
    }
    
    function startAutomationObserver() { /* ... same as before ... */ }
    function makeDraggable(element) { /* ... same as before ... */ }

    // --- 5. INITIALIZATION ---
    function initialize() {
        if (document.getElementById('ai-bridge-panel')) return;
        const appRoot = document.querySelector('app-root');
        if (!appRoot) { setTimeout(initialize, 500); return; }
        createControlPanel();
        setupListeners();
        setTimeout(startAutomationObserver, 1000);
    }
    
    // The content script can run at different times, so we need to be robust.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
