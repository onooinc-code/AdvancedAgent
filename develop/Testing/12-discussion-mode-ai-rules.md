# QA Report: Feature 12 - AI-Generated Discussion Rules

**Feature Description:** Automate the setup of Discussion Mode by using an AI to generate the initial set of conversation rules and the agent reply order.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `services/creation/discussionService.ts` -> `generateDiscussionRulesAndOrder()`
    *   **Purpose:** Calls the Gemini API to generate discussion settings based on agent profiles and conversation history.
    *   **Analysis of Changes:** This is a new service function. It builds a detailed prompt, including agent roles and recent messages, and requests a structured JSON output from the model using a `responseSchema`.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Returns a promise that resolves to an object `{ rules: string; replyOrder: string; }`.
        *   **On Failure:** The `try...catch` block will catch API errors or JSON parsing failures (if the model returns malformed JSON despite the schema). It logs the error and re-throws, which is handled by the calling component.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The model could still occasionally fail to adhere to the JSON schema or return illogical data (e.g., an empty `replyOrder`). The code correctly checks for missing fields and throws an error, which is good. No Gemini guideline violations. Checklist item 1.2 (Validate JSON Parsing) is handled correctly by the `try...catch` block.

*   **File & Function/Component:** `components/ConversationSettingsModal.tsx` -> `handleGenerateDiscussionSettings()`
    *   **Purpose:** An event handler that triggers the AI generation process from the UI.
    *   **Analysis of Changes:** This new async function manages the loading state, calls the `discussionService`, and updates the local component state with the results.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The `isGeneratingRules` state is set to `true`, the service is called, and upon success, the `discussionSettings` state is updated with the new `rules` and `replyOrder`, populating the text fields.
        *   **On Failure:** The `catch` block logs the error. The `finally` block robustly ensures `isGeneratingRules` is set back to `false`, preventing the UI from getting stuck in a loading state.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** If the service fails, the user is not shown a UI error message; the action simply fails silently in the background (apart from a console log). This is a minor UX issue but not a functional bug.
        *   **Checklist Item 3.2 (Component Completeness):** The component correctly handles the loading state by disabling the button and showing a spinner. This is implemented correctly.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: Successfully generate discussion settings**
*   **Given:** The `ConversationSettingsModal` is open and Discussion Mode is enabled.
*   **And:** The `DiscussionService.generateDiscussionRulesAndOrder` is mocked to return `{ rules: "Test rule", replyOrder: "agent-1,agent-2" }`.
*   **When:** The user clicks the "Generate Rules & Order with AI" button.
*   **Then:** The `isGeneratingRules` state should be `true` during the call, then `false`.
*   **And:** The "Conversation Rules" textarea should be updated with the value "Test rule".
*   **And:** The "Reply Order" input should be updated with the value "agent-1,agent-2".

**Scenario: Handle failure during generation**
*   **Given:** The `ConversationSettingsModal` is open and Discussion Mode is enabled.
*   **And:** The `DiscussionService.generateDiscussionRulesAndOrder` is mocked to throw an error.
*   **When:** The user clicks the "Generate Rules & Order with AI" button.
*   **Then:** The `isGeneratingRules` state should be `true` during the call, then `false`.
*   **And:** The text fields for rules and reply order should not change from their original values.
*   **And:** A `console.error` message should be logged.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Happy Path - Generate and save settings**
*   **Objective:** Verify that a user can generate, review, and save AI-proposed discussion settings.
*   **Steps:**
    1.  Open "Conversation Settings" for a chat with some message history.
    2.  Toggle "Enable Discussion Mode" to ON. The rules and order fields appear.
    3.  Click the "Generate Rules & Order with AI" button.
    4.  Wait for the spinner to disappear.
    5.  Observe the populated fields.
    6.  Click "Save Changes".
*   **Expected Result:**
    *   After step 4, the "Conversation Rules" and "Reply Order" text fields are populated with relevant, context-aware suggestions.
    *   After step 6, the modal closes, and the settings are persisted for the conversation.

**Test Case 2: User can edit generated settings**
*   **Objective:** Verify that the generated settings are just suggestions and can be modified by the user.
*   **Steps:**
    1.  Follow steps 1-4 from Test Case 1.
    2.  In the "Reply Order" field, manually add another agent ID to the end of the generated string (e.g., change `agent-1,agent-2` to `agent-1,agent-2,agent-3`).
    3.  Click "Save Changes".
    4.  Re-open the "Conversation Settings".
*   **Expected Result:** The "Reply Order" field should show the manually modified value (`agent-1,agent-2,agent-3`).

**Test Case 3: Verify graceful failure**
*   **Objective:** Ensure the UI remains stable if the AI generation fails.
*   **Setup:** Use browser developer tools to block network requests to `generativelanguage.googleapis.com`.
*   **Steps:**
    1.  Open "Conversation Settings" and enable Discussion Mode.
    2.  Click the "Generate Rules & Order with AI" button.
*   **Expected Result:** The button shows a spinner for a moment, then returns to its normal state. The text fields remain empty or unchanged. The application does not crash, and no error message is displayed to the user (though one appears in the console).