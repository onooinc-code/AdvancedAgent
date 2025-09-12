
# QA Report: Feature 22 - The Awareness Layer

**Feature Description:** Implement an automation engine within the Chrome Extension that allows the AI to request a full diagnostic report from the preview environment. This includes capturing build errors, runtime console errors, and sending the compiled report back to the AI for analysis.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `manifest.json`
    *   **Purpose:** Declares the extension's properties, permissions, and scripts.
    *   **Analysis of Changes:** Added the `"scripting"` permission and included `iframe_injector.js` in `web_accessible_resources`. This is necessary for the content script to inject code into the preview iframe.
    *   **Predicted Behavior & Outputs:** The extension will now have the required permissions to execute its core functionality.
    *   **Identified Risks & Checklist Violations:** The `"scripting"` permission is powerful. The risk is mitigated by the fact that the injection is highly specific to a target frame and file. No checklist violations.

*   **File & Function/Component:** `background.js`
    *   **Purpose:** The extension's service worker, responsible for handling privileged operations like script injection.
    *   **Analysis of Changes:** A new message listener was added for the `INJECT_SCRIPT` type. It uses the `chrome.scripting.executeScript` API, which is the correct and secure method for this task in Manifest V3.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** When it receives a valid request from `content_script.js`, it injects the specified script into the target iframe.
        *   **On Failure:** It catches errors and sends a failure response back to the content script.
    *   **Identified Risks & Checklist Violations:** No significant risks. The logic is clean and uses the modern, recommended Chrome Extension APIs. No checklist violations.

*   **File & Function/Component:** `iframe_injector.js`
    *   **Purpose:** A lightweight script designed to be injected into the preview `<iframe>`. Its sole responsibility is to capture JavaScript errors and send them to its parent window (`content_script.js`).
    *   **Analysis of Changes:** This is a new file. It overrides `console.error` and adds listeners for `window.onerror` and `unhandledrejection`, using `window.parent.postMessage` to communicate findings.
    *   **Predicted Behavior & Outputs:** Any runtime JS error inside the preview app will be caught and sent as a message to the content script.
    *   **Identified Risks & Checklist Violations:** Overriding native functions can be risky, but the implementation is safe as it calls the original function, ensuring normal browser behavior is preserved. Using a specific message type (`MONICA_IFRAME_ERROR`) is good practice. No checklist violations.

*   **File & Function/Component:** `content_script.js`
    *   **Purpose:** The main automation engine. It listens for commands from the AI, scrapes the UI, orchestrates script injection, and sends the final report.
    *   **Analysis of Changes:** This script was significantly refactored to include the automation logic (`parseAndExecuteMonicaCommands`, `handleGetPreviewState`, etc.).
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** When it detects the `GET_PREVIEW_STATE` command in an AI response, it will gather errors from the main debug panel and the preview iframe, format them into a JSON object, and send them back to the AI via the chat input.
        *   **On Failure:** If DOM elements are not found, it logs errors to its own panel but does not crash.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk 1 (Brittleness):** The script relies on specific CSS selectors to find the debug panel and chat input. If the AI Studio frontend changes, these selectors will break. This is an inherent and accepted risk of content scripts.
        *   **Risk 2 (Timing):** The script uses timeouts to wait for the injected script to report errors. This could be flaky if the preview app has a very long load time.
        *   **Checklist Item 3.2 (Component Completeness):** The script handles the "iframe not found" error case gracefully, which is good. The separation of concerns into distinct functions is also well-executed.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: AI command successfully triggers the automation engine**
*   **Given:** The `MutationObserver` is attached to the chat output.
*   **When:** The AI sends a message containing the HTML comment `<!-- MONICA_ACTION: GET_PREVIEW_STATE -->`.
*   **Then:** The `parseAndExecuteMonicaCommands` function should be called.
*   **And:** The `handleGetPreviewState` function should be executed.

**Scenario: Scraper correctly finds a build error**
*   **Given:** The AI Studio debug panel is open and contains an error message within a `.message` element.
*   **When:** The `captureStudioErrors` function is called.
*   **Then:** The function should return an array containing the text of the error message.

**Scenario: Injected script successfully reports a runtime error**
*   **Given:** The `injectAndListenForIframeErrors` function has been called and the listener is active.
*   **And:** The injected script in the iframe captures a `console.error("Test Error")`.
*   **When:** The injected script sends a `postMessage` event.
*   **Then:** The `messageListener` in the content script should receive the event.
*   **And:** The function's promise should resolve with an array containing the string `"console.error: Test Error"`.

**Scenario: Report is correctly formatted and sent**
*   **Given:** The automation engine has collected one build error and one console error.
*   **When:** The `sendReportToMonica` function is called with the report data.
*   **Then:** The chat `textarea`'s value should be set to a formatted string containing a JSON object with the collected errors.
*   **And:** The `click()` method of the send button should be called.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Happy Path - Capture and Report All Errors**
*   **Objective:** Verify the entire workflow from command to report functions correctly when both build and runtime errors are present.
*   **Steps:**
    1.  In the AI Studio code editor, introduce a syntax error into a file (e.g., `App.tsx`) that will cause a build error. The debug panel should show the error.
    2.  In a separate file (e.g., `index.tsx`), add a line that will cause a runtime error, such as `console.error("This is a test runtime error");`.
    3.  Wait for the preview to update.
    4.  Ask the AI to send the command by prompting: `Please check the preview status by sending your command.` (The AI should respond with the command comment).
*   **Expected Result:**
    *   The extension's log panel should show messages indicating it received the command and is gathering data.
    *   After a few seconds, the chat input box should be automatically filled with a JSON report.
    *   The `studioBuildErrors` array in the JSON should contain the build error text.
    *   The `previewConsoleErrors` array in the JSON should contain the text "console.error: This is a test runtime error".
    *   The message should be sent automatically.

**Test Case 2: No Errors Found**
*   **Objective:** Verify the system works correctly when the application is healthy.
*   **Steps:**
    1.  Ensure the application has no build errors and no runtime errors.
    2.  Ask the AI to send the command to check the preview status.
*   **Expected Result:** A report is sent back to the AI, but the `studioBuildErrors` and `previewConsoleErrors` arrays in the JSON are both empty (`[]`).

**Test Case 3: Graceful Failure - Preview Iframe Not Found**
*   **Objective:** Verify the extension does not crash if the preview iframe is not available.
*   **Setup:** (Simulated) Use browser developer tools to delete the preview `<iframe>` element from the page.
*   **Steps:**
    1.  Ask the AI to send the command to check the preview status.
*   **Expected Result:** The extension's log panel should show an error message like "Preview iframe not found." A report should still be sent back to the AI, but the `previewConsoleErrors` array will contain a message indicating the iframe could not be analyzed. The extension remains operational.
