
# Monica AI Interactive Bridge - Full Documentation

## 1. Introduction

The **Monica AI Interactive Bridge** is a Chrome Extension designed to transform Google AI Studio into a powerful, stateful, and automated development environment. It acts as the "senses" and "hands" for an AI development partner, allowing it to persist conversations, interact with the web preview, and follow a structured, autonomous development cycle.

## 2. Installation

1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode" in the top-right corner.
3.  Click "Load unpacked".
4.  Select the `Monica-Extension` folder.
5.  The extension is now installed. Navigate to an AI Studio project, and the control panel will appear.

## 3. UI Breakdown

The extension's control panel appears in the bottom-left of the AI Studio window.

-   **Header**:
    -   **Title**: "AI Interactive Bridge".
    -   **Status Light**: Indicates the connection status with the AI.
        -   **Red (Disconnected)**: The AI has not sent a command recently.
        -   **Yellow (Processing)**: The AI is currently generating a response.
        -   **Green (Connected)**: The AI's latest response contained a valid command, and the bridge is active.
    -   **Minimize/Expand Button (`-`/`+`)**: Collapses or expands the control panel.

-   **Body**:
    -   **🚀 New Session**: Sends the full bootstrap prompt to the AI. This is the starting point for any new work session, establishing the rules and protocols.
    -   **📋 View State**: Opens a modal showing the current `conversationState` object in JSON format. Useful for debugging what the AI "remembers".
    -   **🏷️ View Tags**: Opens a modal showing the status of all available AI commands (Tags).
    -   **✨ View Features**: Opens a modal showing the list of project features and their completion status.
    -   **🟢/🔴 Automation ON/OFF**: A critical toggle. When ON, the extension will autonomously execute any commands (`MONICA_ACTION` tags) it finds in the AI's responses. When OFF, it will detect commands but not execute them, allowing for manual intervention.

## 4. Core Concepts

### 4.1. The Command Protocol (Tags)

The AI communicates its intent to the extension using special HTML comments embedded in its response. The extension actively scans for these comments.

-   **Format**: `<!-- MONICA_ACTION: {"action": "ACTION_NAME", "params": {...}} -->`
-   **Execution**: When "Automation" is ON, the extension parses the JSON and executes the corresponding function.

#### Available Actions:
-   `GET_PREVIEW_STATE`: Triggers a full diagnostic. The extension scrapes build errors from the main UI and injects a script into the preview iframe to capture runtime console errors. It then sends a compiled JSON report back to the AI.
-   `TAKE_SCREENSHOT`: Uses the Chrome Extension API to capture the visible tab and sends the screenshot back to the AI as a base64 data URL.
-   `GET_DOM_STRUCTURE`: Retrieves the `innerHTML` of the preview iframe's body and sends it back to the AI.
-   `INTERACT_ELEMENT`: Allows the AI to perform actions inside the preview.
    -   `params`: `{ "selector": "css-selector", "action": "click" | "getText" }`

### 4.2. The Context & State Protocol

To achieve persistence across sessions, the AI must update a shared context object.

-   **Format**: `<!-- MONICA_UPDATE: {"summary": "...", "context_update": {...}} -->`
-   **Functionality**: At the end of every response, the AI includes this tag. The extension parses the `context_update` object and deep-merges it into the main `conversationState` object. This state is then automatically saved to `chrome.storage.local`, scoped to the current project ID. When the page is reloaded, this state is loaded back into the extension.

-   **State Structure**: The structure of the `conversationState` is formally defined in `conversation_state_schema.json`.

### 4.3. The Autonomous Development Workflow

The extension is designed to facilitate a structured, AI-driven development cycle:

1.  **User/Lead**: Provides a high-level task to the AI.
2.  **AI (Planning)**: The AI creates a plan to implement the task.
3.  **AI (Implementation)**: The AI writes the code and sends it.
4.  **User/Lead**: Applies the code changes in the editor. The preview updates.
5.  **AI (Testing)**: The AI sends a `<!-- MONICA_ACTION: {"action": "GET_PREVIEW_STATE"} -->` command.
6.  **Extension**: Detects the command, runs the diagnostics, and sends the error report back to the AI.
7.  **AI (Debugging)**: The AI reads the report. If there are errors, it generates a fix and returns to step 3. If there are no errors, it proceeds to the next phase (e.g., writing a QA report) or declares the task complete.
