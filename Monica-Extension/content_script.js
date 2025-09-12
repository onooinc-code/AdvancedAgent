(function() {
    'use strict';

    // --- 1. STATE MANAGEMENT ---
    let conversationState = {};
    let cumulativeChangelog = '';
    let isAutomationEnabled = true;
    let tagStatus = {
        GET_PREVIEW_STATE: { status: 'idle', last_run: null },
        TAKE_SCREENSHOT: { status: 'idle', last_run: null },
        GET_DOM_STRUCTURE: { status: 'idle', last_run: null },
        INTERACT_ELEMENT: { status: 'idle', last_run: null },
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
                    <button id="view-features-btn">✨ View Features</button>
                    <button id="toggle-automation-btn" class="automation-on" title="Toggle autonomous execution of commands from the AI.">🟢 Automation ON</button>
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
            modal.style.display = show ? 'flex' : 'none';
        }
    }

    function updateTagStatusUI() {
        const content = document.getElementById('tags-status-content');
        if (!content) return;
        content.innerHTML = '<ul>' + Object.entries(tagStatus).map(([tag, data]) => 
            `<li><span class="status-light-${data.status === 'success' ? 'green' : (data.status === 'running' ? 'yellow' : 'red')}"></span>${tag}<span class="last-run">${data.last_run ? new Date(data.last_run).toLocaleTimeString() : 'Never'}</span></li>`
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
    function getChatInput() { return document.querySelector('textarea[placeholder*="Make changes"]'); }
    function getSendButton() { return document.querySelector('button.send-button'); }
    function setStatusLight(color) {
        const light = document.getElementById('ai-bridge-status-light');
        if(light) {
            light.className = `status-light-${color}`;
            light.title = `Status: ${color === 'green' ? 'Connected & Ready' : (color === 'yellow' ? 'Processing...' : 'Disconnected')}`;
        }
    }

    // --- 4. AUTOMATION & COMMAND HANDLING ---
    async function sendReportToMonica(report) {
        // ... (functionality unchanged)
    }

    // ... (All handle... functions like handleGetPreviewState are unchanged)

    async function parseAndExecuteCommands(node) {
        const changelogRegex = /<!--\s*MONICA_CHANGELOG_START\s*-->([\s\S]*?)<!--\s*MONICA_CHANGELOG_END\s*-->/g;
        const actionRegex = /<!--\s*MONICA_ACTION:\s*({[\s\S]*?})\s*-->/g;
        const updateRegex = /<!--\s*MONICA_UPDATE:\s*({[\s\S]*?})\s*-->/g;

        const html = node.innerHTML;
        let changelogMatch;
        let actionMatch;
        let updateMatch;
        let commandFound = false;
        
        while ((changelogMatch = changelogRegex.exec(html)) !== null) {
            cumulativeChangelog += changelogMatch[1].trim() + '\n\n';
            saveContext();
        }

        while ((actionMatch = actionRegex.exec(html)) !== null) {
            commandFound = true;
            // ... (action execution logic unchanged)
        }

        while ((updateMatch = updateRegex.exec(html)) !== null) {
            commandFound = true;
            // ... (update execution logic unchanged)
        }

        if(commandFound) {
            setStatusLight('green');
        }
    }
    
    function injectCommitButton(modal) {
        if (modal.querySelector('#paste-commit-btn')) return;

        const pasteButton = document.createElement('button');
        pasteButton.id = 'paste-commit-btn';
        pasteButton.textContent = '📋 Paste Commit Details';
        pasteButton.title = 'Paste the accumulated changelog into the commit message.';
        
        pasteButton.addEventListener('click', () => {
            const textarea = modal.querySelector('textarea[formcontrolname="message"]');
            if (textarea) {
                textarea.value = cumulativeChangelog;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                cumulativeChangelog = ''; // Clear after pasting
                saveContext();
            }
        });
        
        const submitButton = modal.querySelector('button.submit-button');
        if (submitButton) {
            submitButton.parentNode.insertBefore(pasteButton, submitButton);
        }
    }


    // --- 5. EVENT LISTENERS & INITIALIZATION ---
    function setupListeners() {
        // Main chat observer (unchanged)
        const chatContainer = document.querySelector('ms-code-assistant-chat ms-autoscroll-container');
        if (chatContainer) {
            const observer = new MutationObserver((mutations) => {
                 // ... (existing logic)
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('turn') && node.classList.contains('output')) {
                            parseAndExecuteCommands(node);
                        }
                    }
                }
            });
            observer.observe(chatContainer, { childList: true, subtree: true });
        }

        // GitHub commit modal observer
        const modalObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    // This selector is specific to the GitHub commit modal's structure
                    if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('[mat-dialog-title] .title')?.textContent.includes('GitHub')) {
                        injectCommitButton(node);
                    }
                }
            }
        });
        modalObserver.observe(document.body, { childList: true });

        document.body.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            // ... (button click logic from previous version, with 'view-features-btn' added)
             if (target.id === 'view-features-btn') {
                updateFeaturesUI();
                toggleModal('features-modal', true);
            }
            if (target.classList.contains('modal-close-btn')) {
                target.closest('.ai-bridge-modal').style.display = 'none';
            }
        });
    }
    
    function saveContext() {
        const projectId = getProjectId();
        if (projectId) {
            const dataToSave = {
                conversationState,
                cumulativeChangelog
            };
            chrome.runtime.sendMessage({ type: 'SAVE_CONTEXT', projectId, data: dataToSave });
        }
    }

    function loadContext() {
        const projectId = getProjectId();
        if (projectId) {
             chrome.runtime.sendMessage({ type: 'LOAD_CONTEXT', projectId }, (response) => {
                 if (response && response.data) {
                     conversationState = response.data.conversationState || {};
                     cumulativeChangelog = response.data.cumulativeChangelog || '';
                 }
             });
        }
    }
    
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = document.getElementById("ai-bridge-header");

        if (header) {
            header.onmousedown = dragMouseDown;
        } else {
            element.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
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
        loadContext();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();