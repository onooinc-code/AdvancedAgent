# QA Report: Feature 21 - Manager Insights Overlay

**Feature Description:** Provide optional, real-time commentary from the AI Manager, offering transparency into its decision-making process.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `services/chat/managerService.ts` -> `generateDynamicPlan()`
    *   **Purpose:** To generate a dynamic plan, now including a high-level `planRationale`.
    *   **Analysis of Changes:** The prompt and `responseSchema` were updated to include a `planRationale` field. The return type now includes this field.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The function will return an object containing both the `plan` array and the `planRationale` string.
        *   **On Failure:** The function will gracefully return a default object with an empty plan and rationale, preventing downstream errors.
    *   **Identified Risks & Checklist Violations:** The model might occasionally provide a weak or unhelpful rationale, but this is a quality-of-response issue, not a technical bug. The implementation is safe. No checklist violations.

*   **File & Function/Component:** `contexts/hooks/useChatHandler.ts` -> `handleSendMessage()`
    *   **Purpose:** To conditionally add "Manager Insight" messages to the conversation flow.
    *   **Analysis of Changes:** New logic was added in both the "Dynamic" and "Moderated Chat" blocks. It checks the `activeConversation.managerSettings.showManagerInsights` flag. If true, it creates a new system `Message` with `messageType: 'insight'` and adds it to the `currentMessages` array.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** When the feature is enabled, a new, yellow-bordered message bubble with a CPU icon will appear in the chat at the appropriate time, displaying the manager's rationale.
        *   **On Failure:** If the flag is false or the rationale is missing from the service response, the logic is skipped, which is correct.
    *   **Identified Risks & Checklist Violations:** No risks. The conditional logic is straightforward.

*   **File & Function/Component:** `components/MessageBubble.tsx` & `components/Avatar.tsx`
    *   **Purpose:** To provide a distinct visual representation for insight messages.
    *   **Analysis of Changes:** `MessageBubble` now checks for `message.messageType === 'insight'` and applies special CSS classes and sets the sender name accordingly. `Avatar` was updated to show a `CpuChipIcon` for the "Manager Insight" sender.
    *   **Predicted Behavior & Outputs:** Insight messages are clearly and correctly differentiated from all other message types.
    *   **Identified Risks & Checklist Violations:** No risks. These are display-only changes.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: Manager insight is displayed in Dynamic mode when enabled**
*   **Given:** The active conversation has `managerSettings.showManagerInsights: true`.
*   **And:** The conversation mode is "Dynamic".
*   **And:** `ManagerService.generateDynamicPlan` is mocked to return a valid plan and a `planRationale` of "This is the plan rationale."
*   **When:** `handleSendMessage` is called.
*   **Then:** A new message should be added to the conversation with `sender: 'system'`, `messageType: 'insight'`, and `text` containing "This is the plan rationale."

**Scenario: Manager insight is NOT displayed in Dynamic mode when disabled**
*   **Given:** The active conversation has `managerSettings.showManagerInsights: false`.
*   **And:** The conversation mode is "Dynamic".
*   **When:** `handleSendMessage` is called.
*   **Then:** No message with `messageType: 'insight'` should be added to the conversation.

**Scenario: Manager insight is displayed in Moderated Chat when enabled**
*   **Given:** The active conversation has `managerSettings.showManagerInsights: true` and `discussionSettings.enabled: true`.
*   **And:** `ManagerService.moderateTurn` is mocked to return a valid decision and a `rationale` of "This is the moderation rationale."
*   **When:** `handleSendMessage` is called.
*   **Then:** A new message should be added to the conversation with `sender: 'system'`, `messageType: 'insight'`, and `text` containing "This is the moderation rationale."

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Verify insight in Dynamic Mode**
*   **Objective:** Confirm that the manager's plan rationale appears when the feature is enabled.
*   **Steps:**
    1.  Select a conversation and open "Conversation Settings".
    2.  Turn ON the "Show Manager Insights" toggle. Save changes.
    3.  Ensure the conversation mode is "Dynamic".
    4.  Send a message, e.g., "Create a plan to write a blog post."
*   **Expected Result:**
    *   After the user's message, a new, visually distinct message appears from "Manager Insight". Its content is the rationale for the plan.
    *   This is followed by the standard "Manager's Plan" message.
    *   The agents then execute the plan as normal.

**Test Case 2: Verify insight in Moderated Chat**
*   **Objective:** Confirm that the manager's turn-by-turn rationale appears when the feature is enabled.
*   **Steps:**
    1.  Select a conversation and open "Conversation Settings".
    2.  Turn ON "Enable Moderated Chat".
    3.  Turn ON "Show Manager Insights". Save changes.
    4.  Send a message to start the discussion.
*   **Expected Result:** After your message, a "Manager Insight" message should appear, explaining why it chose the first agent to speak. After that agent speaks, another insight message may appear explaining the next decision, and so on.

**Test Case 3: Verify disabling the feature hides insights**
*   **Objective:** Ensure that turning the toggle off correctly hides the insight messages.
*   **Steps:**
    1.  Select a conversation and open "Conversation Settings".
    2.  Turn OFF the "Show Manager Insights" toggle. Save changes.
    3.  Perform the actions from Test Case 1 (Dynamic Mode).
    4.  Perform the actions from Test Case 2 (Moderated Chat).
*   **Expected Result:** In both steps 3 and 4, the conversations should proceed as normal, but NO "Manager Insight" messages should appear in the chat log.