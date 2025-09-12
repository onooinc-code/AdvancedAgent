
(function() {
    'use a strict';

    // --- 1. UI & STYLING ---
    function createControlPanel() {
        if (document.getElementById('ai-bridge-panel')) return;
        const styles = `
            #ai-bridge-panel {
                position: fixed; bottom: 20px; left: 20px; z-index: 10000; background-color: rgba(20, 20, 30, 0.85);
                backdrop-filter: blur(10px); border: 1px solid #4a4a6a; border-radius: 10px; padding: 15px;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.4); color: #e0e0e0; font-family: 'Roboto Mono', monospace;
                width: 320px; cursor: move; user-select: none;
            }
            #ai-bridge-panel h3 { margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid #4a4a6a; font-size: 14px; color: #a5b4fc; }
            #ai-bridge-panel .button-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            #ai-bridge-panel button {
                background-color: #6366f1; color: white; border: none; border-radius: 5px; padding: 10px;
                font-size: 12px; cursor: pointer; transition: background-color 0.2s ease;
            }
            #ai-bridge-panel button:hover { background-color: #4f46e5; }
            #ai-bridge-panel button#clear-context-btn { background-color: #b91c1c; }
            #ai-bridge-panel button#clear-context-btn:hover { background-color: #991b1b; }
            #ai-bridge-log { margin-top: 15px; height: 80px; background-color: rgba(0, 0, 0, 0.2); border-radius: 5px; padding: 8px; font-size: 11px; overflow-y: auto; border: 1px solid #4a4a6a; }
            .log-success { color: #81c784; } .log-info { color: #64b5f6; } .log-error { color: #e57373; }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

        const panel = document.createElement('div');
        panel.id = 'ai-bridge-panel';
        panel.innerHTML = `
            <h3>AI Interactive Bridge</h3>
            <div class="button-grid">
                 <button id="load-context-btn">🚀 Load Last Context</button>
                 <button id="copy-preview-html-btn">📋 Copy Preview HTML</button>
                 <button id="clear-context-btn">🗑️ Clear Saved Context</button>
            </div>
            <div id="ai-bridge-log"><div class="log-info">[${new Date().toLocaleTimeString()}] Bridge Initialized.</div></div>
        `;
        
        document.body.appendChild(panel);
        makeDraggable(panel);
    }

    function log(message, type = 'info') {
        const logEl = document.getElementById('ai-bridge-log');
        if (logEl) {
            const time = new Date().toLocaleTimeString();
            const newLog = document.createElement('div');
            newLog.className = `log-${type}`;
            newLog.textContent = `[${time}] ${message}`;
            logEl.appendChild(newLog);
            logEl.scrollTop = logEl.scrollHeight;
        }
    }
    
    // --- 2. CORE FUNCTIONALITY & HELPERS ---
    function getProjectId() { try { return window.location.pathname.split('/drive/')[1].split('/')[0]; } catch (e) { return null; } }
    function getPreviewIframe() { return document.querySelector('iframe[title="Preview"]'); }
    function getChatInput() { return document.querySelector('textarea[placeholder*="Make changes"]'); }
    function getSendButton() { return document.querySelector('button[aria-label="Send"]'); }

    function saveConversationContext(data) {
        const projectId = getProjectId();
        if (!projectId) { log('Could not identify Project ID.', 'error'); return; }
        chrome.runtime.sendMessage({ type: 'SAVE_CONTEXT', data, projectId }, (response) => {
            if (response && response.status === 'success') {
                log(`Context ${data === null ? 'cleared' : 'saved automatically'}.`, 'success');
            } else { log('Failed to save context.', 'error'); }
        });
    }

    function loadConversationContext() {
        const projectId = getProjectId();
        if (!projectId) { log('Could not identify Project ID.', 'error'); return; }

        chrome.runtime.sendMessage({ type: 'LOAD_CONTEXT', projectId }, (response) => {
            if (response && response.data) {
                const context = response.data;
                const input = getChatInput();
                const sendBtn = getSendButton();

                if (!input || !sendBtn) {
                    log('Chat input/button not found.', 'error');
                    return;
                }
                
                const prompt = `This is a new session. Please use the following JSON context to remember our previous state and continue our work.\n\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\``;
                input.value = prompt;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => sendBtn.click(), 100);
                log('Context loaded and sent.', 'success');
            } else {
                log('No saved context found for this project.', 'info');
                alert('No saved context found.');
            }
        });
    }

    // --- 3. AUTOMATION LOGIC ---
    function handleBuildError(panel) {
        const autoFixBtn = panel.querySelector('button.ms-button-borderless');
        if (autoFixBtn && autoFixBtn.textContent.trim() === 'Auto-fix') {
            log('Build error detected. Clicking "Auto-fix".', 'info');
            autoFixBtn.click();
        }
    }

    function handleConsoleError(panel) {
        const errorMessageNode = panel.querySelector('.error.type + .message');
        if (errorMessageNode && errorMessageNode.textContent.trim()) {
            const errorMessage = errorMessageNode.textContent.trim();
            
            const input = getChatInput();
            const sendBtn = getSendButton();

            if (input && sendBtn && !sendBtn.disabled) {
                const prompt = `I've encountered a runtime error in the preview. Please analyze and fix it.\n\nError:\n\`\`\`\n${errorMessage}\n\`\`\``;
                input.value = prompt;
                input.dispatchEvent(new Event('input', { bubbles: true })); // Crucial for framework change detection
                setTimeout(() => {
                    sendBtn.click();
                    log('Error sent to AI for analysis.', 'success');
                }, 200); // Small delay to ensure UI updates
            } else {
                log('Could not find chat input or send button is disabled.', 'error');
            }
        }
    }

    // --- 4. EVENT LISTENERS & INITIALIZATION ---
    function setupListeners() {
        // Observer to watch for my responses and auto-save context
        const chatObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('turn') && node.classList.contains('output')) {
                        const contextRegex = /<!--\s*MONICA_CONTEXT_DATA:\s*({[\s\S]*?})\s*-->/g;
                        const match = contextRegex.exec(node.innerHTML);
                        if (match && match[1]) {
                            try {
                                const contextData = JSON.parse(match[1]);
                                saveConversationContext(contextData);
                            } catch (e) { log(`Failed to parse context data: ${e.message}`, 'error'); }
                        }
                    }
                }
            }
        });

        // Main observer for error panels
        const mainObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== Node.ELEMENT_NODE) continue;

                    // Check for Build Error panel
                    const buildErrorPanel = node.querySelector('.fix-errors-container');
                    if (buildErrorPanel) {
                        handleBuildError(buildErrorPanel);
                        // No need to check for the other error type if this one is found
                        continue; 
                    }

                    // Check for Console Error panel
                    const consoleErrorPanel = node.querySelector('ms-console-status');
                    if (consoleErrorPanel) {
                        handleConsoleError(consoleErrorPanel);
                    }
                }
            }
        });

        const chatContainer = document.querySelector('ms-code-assistant-chat ms-autoscroll-container');
        if (chatContainer) {
            chatObserver.observe(chatContainer, { childList: true, subtree: true });
        } else {
            log('Chat container not found for context observer.', 'error');
        }

        // Observe the entire body for error panels
        mainObserver.observe(document.body, { childList: true, subtree: true });

        // Button listeners
        document.body.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.id === 'load-context-btn') {
                 loadConversationContext();
            } else if (target.id === 'copy-preview-html-btn') {
                 const iframe = getPreviewIframe();
                 if (iframe && iframe.contentDocument) {
                     navigator.clipboard.writeText(iframe.contentDocument.documentElement.outerHTML)
                        .then(() => log('Preview HTML copied!', 'success'));
                 } else {
                    log('Preview iframe not found.', 'error');
                 }
            } else if (target.id === 'clear-context-btn') { 
                if (window.confirm('Are you sure you want to clear the saved context for this project?')) {
                    saveConversationContext(null);
                }
            }
        });
    }
    
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // --- INITIALIZATION ---
    function initialize() {
        if (document.getElementById('ai-bridge-panel')) return;
        const appRoot = document.querySelector('app-root');
        if (!appRoot) {
            setTimeout(initialize, 1000);
            return;
        }
        createControlPanel();
        setupListeners();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
