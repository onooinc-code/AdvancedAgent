# QA Report: Feature 01 - Conversation Lifecycle

**Feature Description:** Provide users with the fundamental capabilities to create, navigate, manage, and delete conversations.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `contexts/hooks/useConversationManager.ts` -> `handleNewConversation()`
    *   **Purpose:** Creates a new, empty conversation and sets it as the active one.
    *   **Analysis of Changes:** This is a core function for this feature.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Creates a `Conversation` object with a unique ID, default title, and empty messages array. It prepends this to the `conversations` array and updates `activeConversationId` to the new ID.
        *   **On Failure:** This function is synchronous and primarily manipulates state. Failure is highly unlikely unless there's a fundamental React state issue.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The ID `conv-${Date.now()}` is not guaranteed to be unique if called in rapid succession, but it is sufficient for this client-side application. No checklist violations.

*   **File & Function/Component:** `contexts/hooks/useConversationManager.ts` -> `handleDeleteConversation()`
    *   **Purpose:** Removes a conversation from the list.
    *   **Analysis of Changes:** Core deletion logic.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Filters the specified `conversationId` out of the `conversations` array. If the deleted conversation was the active one, it intelligently sets the new active ID to the first conversation in the remaining list or `null` if the list becomes empty.
        *   **On Failure:** Synchronous state manipulation; failure is unlikely.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The logic for selecting the next conversation is crucial. If it failed, the user could be left with a blank screen. The current implementation (`newConversations.length > 0 ? newConversations[0].id : null`) is robust. No checklist violations.

*   **File & Function/Component:** `components/ConversationList.tsx`
    *   **Purpose:** Renders the list of conversations and the "New Chat" button.
    *   **Analysis of Changes:** The main UI component for this feature.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Renders a list of `ConversationItem` components. Shows an empty state message if `conversations` is empty. The "New Chat" button is correctly wired to `handleNewConversation`.
        *   **On Failure:** n/a
    *   **Identified Risks & Checklist Violations:**
        *   **Checklist Item:** 3.2 (Component Completeness). The component correctly handles the empty state (`conversations.length > 0 ? ... : ...`). This is good practice.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: User creates a new conversation**
*   **Given:** A `useConversationManager` hook initialized with 2 existing conversations.
*   **When:** `handleNewConversation()` is called.
*   **Then:** The `conversations` array should now contain 3 items.
*   **And:** The `activeConversationId` should be the ID of the newly created conversation.
*   **And:** The new conversation should be the first item in the array.

**Scenario: User deletes an inactive conversation**
*   **Given:** A `useConversationManager` hook with 3 conversations, and the active conversation is the first one.
*   **When:** `handleDeleteConversation()` is called with the ID of the second conversation.
*   **Then:** The `conversations` array should contain 2 items.
*   **And:** The `activeConversationId` should remain unchanged.

**Scenario: User deletes the active conversation**
*   **Given:** A `useConversationManager` hook with 3 conversations, and the active conversation is the second one.
*   **When:** `handleDeleteConversation()` is called with the ID of the second conversation.
*   **Then:** The `conversations` array should contain 2 items.
*   **And:** The `activeConversationId` should now be the ID of the first conversation in the updated list.

**Scenario: User deletes the last conversation**
*   **Given:** A `useConversationManager` hook with 1 conversation, which is active.
*   **When:** `handleDeleteConversation()` is called with the ID of that conversation.
*   **Then:** The `conversations` array should be empty.
*   **And:** The `activeConversationId` should be `null`.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Create a new chat successfully**
*   **Objective:** Verify a user can create a new conversation.
*   **Steps:**
    1.  Load the application.
    2.  Click the "+" (New Chat) icon in the sidebar.
*   **Expected Result:** A new chat titled "New Chat" appears at the top of the conversation list and is highlighted as active. The main chat view becomes empty, ready for a new conversation.

**Test Case 2: Navigate between conversations**
*   **Objective:** Verify a user can switch between different conversations.
*   **Steps:**
    1.  Create at least two conversations.
    2.  Send a message in the first conversation (e.g., "Hello").
    3.  Click on the second conversation in the list.
    4.  Click back on the first conversation.
*   **Expected Result:** The main view updates to show the correct message history for the selected conversation each time.

**Test Case 3: Delete a conversation**
*   **Objective:** Verify a user can delete a conversation.
*   **Steps:**
    1.  Create a conversation you want to delete.
    2.  Hover over its item in the sidebar and click the trash can icon.
    3.  A confirmation prompt appears. Click "OK".
*   **Expected Result:** The conversation is removed from the list in the sidebar. The view switches to another available conversation.

**Test Case 4: Delete the last remaining conversation**
*   **Objective:** Verify the UI handles the removal of all conversations gracefully.
*   **Steps:**
    1.  Delete all conversations until only one remains.
    2.  Delete the final conversation.
*   **Expected Result:** The conversation list shows the "No chats yet" message. The main chat area displays the welcome screen.
