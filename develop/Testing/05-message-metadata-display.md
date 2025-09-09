# QA Report: Feature 05 - Message Metadata Display

**Feature Description:** Provide users with transparency and context for each message by displaying creation timestamp and AI response time.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `contexts/hooks/useChatHandler.ts` -> `handleSendMessage` & `handleManualSelection`
    *   **Purpose:** To calculate and attach the AI response time to the message object.
    *   **Analysis of Changes:** The code wraps the call to `AgentService.generateResponse` between two `performance.now()` calls. The difference is calculated and stored in the `responseTimeMs` property of the new `Message` object.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The `aiMessage` object will contain a `responseTimeMs` property with a positive integer value (e.g., `1845`).
        *   **On Failure:** If `generateResponse` throws an error, the code proceeds to the `catch` block, and no AI message with a response time is created. The logic is sound.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** `performance.now()` is a high-resolution timer. There are no significant risks with its usage here. The calculation is simple and robust. No checklist violations.

*   **File & Function/Component:** `components/MessageBubble.tsx`
    *   **Purpose:** To conditionally render the metadata in the message footer.
    *   **Analysis of Changes:** A `div` with timing information is placed at the bottom of the bubble. Its visibility is controlled by the Tailwind CSS `group-hover:opacity-100` utility, making it appear when the user hovers over the message group.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The timestamp is always rendered. The `responseTimeMs` is rendered inside a `span` only if `message.responseTimeMs` is a truthy value (i.e., it exists and is not 0). The footer is invisible by default and becomes visible on hover.
        *   **On Failure:** n/a
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** This is a pure display component. The only minor "risk" is a CSS conflict that could make the footer permanently visible or invisible, but this is unlikely with Tailwind's utility-first approach. No checklist violations.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: AI message object includes response time**
*   **Given:** The `handleSendMessage` function is called.
*   **And:** The `AgentService.generateResponse` call is mocked and takes 500ms to resolve.
*   **When:** The function successfully receives a response from the service.
*   **Then:** The new AI `Message` object passed to `onUpdateConversation` should have a `responseTimeMs` property with a value close to 500.

**Scenario: Message bubble for a user renders only timestamp**
*   **Given:** A `MessageBubble` component is rendered with a message where `sender` is `'user'`.
*   **When:** The component HTML is inspected.
*   **Then:** The footer `div` should contain the message's formatted timestamp.
*   **And:** The footer `div` should NOT contain a `span` for `responseTimeMs`.

**Scenario: Message bubble for an AI renders timestamp and response time**
*   **Given:** A `MessageBubble` component is rendered with a message that has `sender: 'agent-1'` and `responseTimeMs: 1234`.
*   **When:** The component HTML is inspected.
*   **Then:** The footer `div` should contain the message's formatted timestamp.
*   **And:** The footer `div` should contain a `span` with the text "1234ms".

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Verify metadata on user message**
*   **Objective:** Ensure user-sent messages display only the timestamp on hover.
*   **Steps:**
    1.  Send a new message, for example, "Test message".
    2.  Hover your mouse cursor over the message bubble you just sent.
*   **Expected Result:** A footer appears at the bottom-right of the bubble, showing only the time it was sent (e.g., "11:42 AM"). When you move the mouse away, the footer disappears.

**Test Case 2: Verify metadata on AI message**
*   **Objective:** Ensure AI-generated messages display both timestamp and response time on hover.
*   **Steps:**
    1.  Send a message that will elicit an AI response.
    2.  Wait for the AI agent to reply.
    3.  Hover your mouse cursor over the AI's message bubble.
*   **Expected Result:** A footer appears at the bottom-right of the bubble, showing the time it was sent AND the response time in milliseconds (e.g., "11:43 AM 1658ms").

**Test Case 3: Verify metadata does not appear on system messages**
*   **Objective:** Ensure error or system messages do not show metadata.
*   **Setup:** Go to Settings -> Agent Manager and set an invalid model name to force an error. Save changes.
*   **Steps:**
    1.  Send a message. The app will fail to get a response and generate a system error message.
    2.  Hover your mouse cursor over the system error message bubble.
*   **Expected Result:** No metadata footer appears on hover. (Note: This is the current behavior, as system messages don't have the same structure. This test confirms that.)
