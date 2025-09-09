
# QA Report: Feature 03 - Per-Conversation Settings

**Feature Description:** Give users granular control over the behavior and features of each individual conversation, overriding global default settings.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `components/ConversationSettingsModal.tsx`
    *   **Purpose:** Provides the UI for a user to change conversation-specific settings.
    *   **Analysis of Changes:** This is the primary UI for the feature. It uses local component state for edits and only commits them to the global state on save.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The modal loads the settings from the `activeConversation`. User changes update local state. Clicking "Save" calls `handleUpdateConversation` with the new settings and closes the modal.
        *   **On Failure:** n/a
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** If the user closes the modal without saving, their changes should be discarded. The current implementation handles this correctly because the local state is re-initialized from `activeConversation` every time the modal is opened (`useEffect` hook). This is a good, safe pattern. No checklist violations.

*   **File & Function/Component:** `contexts/hooks/useConversationManager.ts` -> `handleUpdateConversation()`
    *   **Purpose:** A generic utility function to update any part of a conversation object.
    *   **Analysis of Changes:** It merges a partial `Conversation` object into the existing state.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Correctly finds the conversation by ID and applies the updates using the spread operator `{ ...c, ...updates }`.
        *   **On Failure:** Synchronous state manipulation, failure is unlikely.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** This function is powerful. If an incorrect partial update is passed (e.g., with a misspelled key), it could add junk data to the conversation state. This is a general risk of using partial types, but acceptable. No checklist violations.

*   **File & Function/Component:** `contexts/hooks/useChatHandler.ts`
    *   **Purpose:** The chat logic needs to consume the per-conversation settings.
    *   **Analysis of Changes:** It correctly accesses `activeConversation.systemInstructionOverride` and passes it down to the service layer.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** If an override exists, it will be used for the system instruction in API calls. If not, the agent's default instruction is used.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** A developer could forget to check for the override in a new AI-related function. This requires discipline to maintain. No checklist violations in the current code.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: User saves a system instruction override**
*   **Given:** The `ConversationSettingsModal` is open for a conversation.
*   **When:** The user types "Respond like a pirate" into the system override textarea.
*   **And:** The user clicks the "Save Changes" button.
*   **Then:** The `handleUpdateConversation` function should be called with the conversation ID and an object containing `{ systemInstructionOverride: 'Respond like a pirate' }`.

**Scenario: User toggles a feature flag**
*   **Given:** The `ConversationSettingsModal` is open, and the "Auto-Summarization" flag is initially `true`.
*   **When:** The user clicks the toggle for "Auto-Summarization".
*   **And:** The user clicks the "Save Changes" button.
*   **Then:** The `handleUpdateConversation` function should be called with an object containing `{ featureFlags: { ..., autoSummarization: false } }`.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Verify system instruction override works**
*   **Objective:** Ensure the per-conversation system instruction correctly modifies AI behavior.
*   **Steps:**
    1.  Select a conversation.
    2.  Click the "Conversation Settings" icon in the header.
    3.  In the "System Instruction Override" box, type: `You are a pirate. All responses must be in pirate speak, ahoy!`
    4.  Click "Save Changes".
    5.  Back in the chat, send the message: "Hello, who are you?"
*   **Expected Result:** The AI agent should respond in pirate-speak (e.g., "Ahoy, matey! I be a humble AI assistant, ready to sail the digital seas!").

**Test Case 2: Verify feature flag toggle works (Auto-Summarization)**
*   **Objective:** Ensure feature flags can be enabled and disabled per conversation.
*   **Steps:**
    1.  Select a conversation and open its settings.
    2.  Ensure the "Auto-Summarization" toggle is OFF. Click "Save Changes".
    3.  Ask the AI for a very long response (e.g., "Tell me a 500-word story about a robot").
    4.  Verify the response is NOT collapsed.
    5.  Go back to settings, turn the "Auto-Summarization" toggle ON, and save.
    6.  Start a new line and ask for another long story.
*   **Expected Result:** The first long story should be fully expanded. The second long story should be collapsed by default with a "Show More" button.
