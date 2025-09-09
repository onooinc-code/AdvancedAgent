# QA Report: Feature 11 - Discussion Mode (Core)

**Feature Description:** Create an interactive mode where multiple AI agents can engage in a conversation with each other in a predefined sequence after a user prompt.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `contexts/hooks/useChatHandler.ts` -> `handleSendMessage()`
    *   **Purpose:** Orchestrates the entire chat flow, now including the new discussion mode logic.
    *   **Analysis of Changes:** A major new branch was added. If discussion mode is enabled, the function enters a `for` loop that iterates through the `replyOrder`. Inside the loop, it sequentially calls `AgentService.generateResponse` for each agent, `await`ing each response before proceeding. It correctly accumulates messages in a local `currentMessages` variable to provide the full, updated context to the next agent in the sequence.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The function will add the user's message, then sequentially add one message for each agent in the `replyOrder`. The UI will update after each agent response. The `loadingStage` will be updated for each step and finally reset to `idle`.
        *   **On Failure:** If any `AgentService.generateResponse` call within the loop fails, the function will jump to the `catch` block. The `finally` block ensures the `loadingStage` is always reset to `idle`, preventing a stuck UI. The sequential nature means a failure on agent 1 will prevent agent 2 from ever being called.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk 1:** A very long `replyOrder` (e.g., 10 agents) could lead to a long, uninterruptible operation. The UI will be locked for the duration. This is an acceptable risk for the core feature, but a future improvement might include a "cancel" button.
        *   **Risk 2:** The parsing of the comma-separated `replyOrder` string is simple (`.split(',')`). If a user enters an invalid agent ID, that agent will simply be skipped. This is a graceful way to handle typos. No checklist violations.

*   **File & Function/Component:** `components/ConversationSettingsModal.tsx`
    *   **Purpose:** Allows the user to enable and configure discussion mode.
    *   **Analysis of Changes:** Uses local state `discussionSettings` which is initialized from the active conversation. The UI conditionally renders input fields when the mode is enabled. The "System Instruction Override" is correctly disabled when discussion mode is on to prevent confusion, as the "Conversation Rules" field serves that purpose.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** User changes are stored in local state. On "Save", `handleUpdateConversation` is called with the updated `discussionSettings` object.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The component correctly handles cases where `activeConversation.discussionSettings` might be `undefined` (for older conversations) by defaulting it. This prevents potential null reference errors. No checklist violations.

*   **File & Function/Component:** `components/LiveStatusIndicator.tsx`
    *   **Purpose:** To show the current status of the AI operation.
    *   **Analysis of Changes:** A new `case` for the `discussing` stage was added to the `switch` statement.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** When `loadingStage` is `discussing`, it will render a message like "Creative Writer is responding (1/3)...", providing clear, granular feedback to the user.
    *   **Identified Risks & Checklist Violations:** No risks. This is a simple display component.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: A message is sent in a discussion-enabled chat**
*   **Given:** The `useChatHandler`'s active conversation has `discussionSettings.enabled = true`.
*   **And:** The `replyOrder` is `"agent-1,agent-2"`.
*   **When:** `handleSendMessage` is called with "Start discussion".
*   **Then:** The `onUpdateConversation` function should be called a total of 3 times.
*   **And:** The first call should add the user's message.
*   **And:** The second call should add the response from `agent-1`.
*   **And:** The third call should add the response from `agent-2`.
*   **And:** The `AgentService.generateResponse` for `agent-2` must have been called with a message history that includes `agent-1`'s response.

**Scenario: Discussion mode is enabled with an invalid agent ID in reply order**
*   **Given:** The `useChatHandler`'s active conversation has `discussionSettings.enabled = true`.
*   **And:** The `replyOrder` is `"agent-1,invalid-agent,agent-2"`.
*   **When:** `handleSendMessage` is called.
*   **Then:** The `AgentService.generateResponse` should be called for `agent-1` and `agent-2`.
*   **And:** The service should NOT be called for `"invalid-agent"`.
*   **And:** The function should complete without errors.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Happy Path - Two-agent discussion**
*   **Objective:** Verify that two agents can reply sequentially to a user prompt.
*   **Steps:**
    1.  Open "Conversation Settings" for a chat.
    2.  Toggle "Enable Discussion Mode" to ON.
    3.  Set "Reply Order" to `agent-1,agent-2`.
    4.  Set "Conversation Rules" to a simple instruction, e.g., "Debate the pros and cons."
    5.  Save the settings.
    6.  Verify the "Discussion Mode" badge appears in the header.
    7.  Send a message: "Topic: Should AI be used in creative writing?"
*   **Expected Result:**
    *   First, the user's message appears. The live status indicator shows "Creative Writer is responding (1/2)...".
    *   Then, the Creative Writer's response appears. The status indicator immediately changes to "Technical Analyst is responding (2/2)...".
    *   Finally, the Technical Analyst's response appears. The status indicator disappears, and the message input becomes enabled again.

**Test Case 2: Verify user input is disabled during discussion**
*   **Objective:** Ensure the user cannot interrupt the agent-to-agent sequence.
*   **Steps:**
    1.  Start a discussion as in Test Case 1.
    2.  While the status indicator is active (showing either agent is responding), try to type in the message input box and click the send button.
*   **Expected Result:** The message input textarea and the send button should be disabled and unresponsive. They should only become enabled after the full sequence is complete.

**Test Case 3: Verify disabling discussion mode reverts to normal**
*   **Objective:** Confirm that toggling the feature off restores the original chat behavior.
*   **Steps:**
    1.  In a discussion-enabled chat, go to "Conversation Settings".
    2.  Toggle "Enable Discussion Mode" to OFF. Save settings.
    3.  Verify the "Discussion Mode" badge in the header has disappeared.
    4.  Send a message.
*   **Expected Result:** Only one agent (the one chosen by the AI Manager) responds, or manual suggestions appear, depending on the "AI Agent" / "Manual" toggle. The multi-agent sequence does not trigger.