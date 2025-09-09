
# QA Report: Feature 06 - Long Message Handling

**Feature Description:** Improve readability by automatically collapsing and summarizing long AI responses, controlled by a per-conversation feature flag.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `components/MessageBubble.tsx`
    *   **Purpose:** Contains all the UI and state logic for handling long messages.
    *   **Analysis of Changes:**
        1.  It defines constants `LONG_MESSAGE_LINES` and `LONG_MESSAGE_CHARS` to determine what constitutes a "long" message.
        2.  A boolean `isLongMessageEnabled` checks both the message length and the `featureFlags.autoSummarization` from the conversation.
        3.  A local state `isExpanded` is initialized to `!isLongMessageEnabled`, correctly setting the initial state.
        4.  The `getMessageContent()` function conditionally truncates the text based on the `isExpanded` state.
        5.  A "Show More" / "Show Less" button is conditionally rendered.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** If a message is long and the feature flag is on, it will render a truncated preview and the "Show More" button. Clicking the button will toggle the `isExpanded` state, causing a re-render with the full or truncated content.
        *   **On Failure:** n/a
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The truncation logic (slicing by lines or characters) is simple and could potentially cut off a word or markdown sequence awkwardly. This is a minor UX risk but acceptable for the feature's goal. A more advanced implementation might truncate at the end of a sentence. No checklist violations. The logic is self-contained and well-handled with local state.

*   **File & Function/Component:** `components/ConversationSettingsModal.tsx`
    *   **Purpose:** Provides the UI to toggle the `autoSummarization` feature flag.
    *   **Analysis of Changes:** It uses the `ToggleSwitch` component to control the `featureFlags.autoSummarization` state, which is saved via `handleUpdateConversation`.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Toggling the switch and saving will correctly update the `autoSummarization` boolean on the active conversation object.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** No significant risks. The connection between the toggle and the conversation state is direct. No checklist violations.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: A long message is collapsed by default**
*   **Given:** A `MessageBubble` receives a message with 30 lines of text.
*   **And:** The `featureFlags.autoSummarization` prop is `true`.
*   **When:** The component renders for the first time.
*   **Then:** The rendered content should be truncated (e.g., contain "...").
*   **And:** A button with the text "Show More" should be visible.

**Scenario: A long message is expanded on click**
*   **Given:** A long message is rendered in its collapsed state.
*   **When:** The user clicks the "Show More" button.
*   **Then:** The component should re-render with the full, untruncated message content.
*   **And:** The button's text should change to "Show Less".

**Scenario: A long message is not collapsed when the feature flag is off**
*   **Given:** A `MessageBubble` receives a message with 30 lines of text.
*   **And:** The `featureFlags.autoSummarization` prop is `false`.
*   **When:** The component renders.
*   **Then:** The rendered content should be the full, untruncated message.
*   **And:** No "Show More" or "Show Less" button should be visible.

**Scenario: A short message is never collapsed**
*   **Given:** A `MessageBubble` receives a message with 5 lines of text.
*   **And:** The `featureFlags.autoSummarization` prop is `true`.
*   **When:** The component renders.
*   **Then:** The rendered content should be the full, untruncated message.
*   **And:** No "Show More" or "Show Less" button should be visible.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Verify auto-collapse functionality**
*   **Objective:** Ensure long AI messages are collapsed when the feature is enabled.
*   **Preconditions:** In "Conversation Settings", ensure "Auto-Summarization" is ON.
*   **Steps:**
    1.  Send a prompt to the AI that will generate a long response, e.g., "Write a 500-word essay on the history of the internet."
*   **Expected Result:** The AI's response bubble appears truncated, showing only the first ~20 lines of text, followed by a "Show More" button.

**Test Case 2: Verify expand and collapse interaction**
*   **Objective:** Ensure the "Show More" / "Show Less" button works as expected.
*   **Preconditions:** A long message has been received and is in its collapsed state.
*   **Steps:**
    1.  Click the "Show More" button.
    2.  Scroll through the entire message.
    3.  Click the "Show Less" button.
*   **Expected Result:**
    *   After step 1, the message bubble expands to show the full content, and the button text changes to "Show Less".
    *   After step 3, the message bubble returns to its original truncated state, and the button text reverts to "Show More".

**Test Case 3: Verify feature flag disables collapse**
*   **Objective:** Ensure that when the feature is disabled, long messages are not collapsed.
*   **Steps:**
    1.  Go to "Conversation Settings" and turn the "Auto-Summarization" toggle OFF. Save changes.
    2.  Send another prompt that will generate a long response.
*   **Expected Result:** The AI's response bubble appears fully expanded by default. There is no "Show More" button.
