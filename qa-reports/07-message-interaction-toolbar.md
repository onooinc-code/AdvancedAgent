
# QA Report: Feature 07 - Message Interaction Toolbar (Standard Actions)

**Feature Description:** Provide users with a standard set of tools to manage and interact with individual messages (copy, bookmark, edit, delete).

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `contexts/hooks/useConversationManager.ts`
    *   **Purpose:** Contains the core state logic for all message interactions.
    *   **Analysis of Changes:**
        *   `handleToggleMessageBookmark`: Correctly toggles the `isBookmarked` boolean on a message.
        *   `handleDeleteMessage`: Correctly filters a message from the array after a `window.confirm`.
        *   `handleToggleMessageEdit` & `handleUpdateMessageText`: Safely manage the editing state and update message content.
    *   **Predicted Behavior & Outputs:** These functions are synchronous state updates. They are well-contained and directly manipulate the `conversations` array.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The main risk, accidental data loss from deletion, is correctly mitigated with a confirmation dialog. The logic is sound. No checklist violations.

*   **File & Function/Component:** `components/MessageBubble.tsx`
    *   **Purpose:** To render the toolbar icons and wire them to the context functions.
    *   **Analysis of Changes:** The component's footer contains buttons for Copy, Bookmark, Edit, and Trash.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The correct icons are displayed. The `EditIcon` is correctly rendered only for user messages. The bookmark icon correctly toggles between its filled and unfilled state based on `message.isBookmarked`.
        *   **On Failure:** n/a
    *   **Identified Risks & Checklist Violations:** No risks. The conditional rendering logic is straightforward and correct.

*   **File & Function/Component:** `components/BookmarkedMessagesPanel.tsx`
    *   **Purpose:** To display all bookmarked messages for the active conversation.
    *   **Analysis of Changes:** This component filters the message list to find bookmarked items and provides a UI to navigate to them. The `handleGoToMessage` function uses `scrollIntoView` and adds a temporary highlight class.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The panel shows a list of bookmarked messages. Clicking an item smoothly scrolls the main chat window to that message and flashes a highlight on it.
    *   **Identified Risks & Checklist Violations:**
        *   **Checklist Item 3.2 (Component Completeness):** The component correctly handles the empty state by showing a helpful message. This is a complete and user-friendly implementation.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: User bookmarks and un-bookmarks a message**
*   **Given:** A `useConversationManager` hook with a message whose `isBookmarked` is `false`.
*   **When:** `handleToggleMessageBookmark` is called for that message.
*   **Then:** The message's `isBookmarked` property should become `true`.
*   **When:** `handleToggleMessageBookmark` is called for that message again.
*   **Then:** The message's `isBookmarked` property should become `false`.

**Scenario: User edits a message**
*   **Given:** A user message with text "Hello".
*   **When:** `handleToggleMessageEdit` is called for the message.
*   **Then:** The message's `isEditing` property should become `true`.
*   **When:** `handleUpdateMessageText` is called with "Hello World".
*   **Then:** The message's `text` property should be "Hello World".
*   **And:** The message's `isEditing` property should become `false`.

**Scenario: User deletes a message**
*   **Given:** A conversation with 3 messages.
*   **And:** The `window.confirm` is mocked to return `true`.
*   **When:** `handleDeleteMessage` is called for the second message.
*   **Then:** The conversation's `messages` array should now contain only 2 items.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Bookmark workflow**
*   **Objective:** Verify the entire bookmarking feature from creation to navigation.
*   **Steps:**
    1.  Send a message.
    2.  Hover over the message and click the bookmark icon. The icon should change to a filled state.
    3.  In the main header, click the bookmark icon to open the right-hand panel.
    4.  Verify your message is listed in the panel.
    5.  Click the message item in the panel.
*   **Expected Result:** The main chat view scrolls smoothly to the original message, which briefly flashes with a highlight.

**Test Case 2: Edit user message workflow**
*   **Objective:** Verify a user can edit their own messages but not AI messages.
*   **Steps:**
    1.  Send a message (e.g., "helo world"). An AI will respond.
    2.  Hover over your user message. Click the "Edit" icon.
    3.  The message bubble should turn into a textarea. Correct the text to "hello world".
    4.  Press "Enter" or click the "Save" button.
    5.  Hover over the AI's response message.
*   **Expected Result:** Your message text is updated. The AI message's toolbar should NOT contain an "Edit" icon.

**Test Case 3: Delete message workflow**
*   **Objective:** Verify a user can delete both their own and AI messages.
*   **Steps:**
    1.  Send a message. An AI will respond.
    2.  Hover over the AI's message and click the trash can icon.
    3.  A confirmation dialog appears. Click "OK".
*   **Expected Result:** The AI's message is removed from the conversation history.
