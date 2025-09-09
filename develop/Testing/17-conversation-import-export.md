
# QA Report: Feature 17 - Conversation Import/Export

**Feature Description:** Provide users with the ability to back up their conversations to a local file and restore them later.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `contexts/hooks/useConversationManager.ts` -> `handleExportConversations()`
    *   **Purpose:** To serialize the current conversations to a JSON file and trigger a browser download.
    *   **Analysis of Changes:** This new function gets the `conversations` array from state, stringifies it, creates a data URL, and programmatically clicks a temporary link element to initiate the download.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The browser's "Save File" dialog will open, pre-filled with a filename like `ai-assistant-backup-YYYY-MM-DD.json`.
        *   **On Failure:** The `try...catch` block will show a browser `alert()` if `JSON.stringify` or any other part fails.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** `JSON.stringify` can fail on circular data structures, but the `Conversation` type is a simple tree, so this is not a risk. The DOM interaction is standard and safe. No checklist violations.

*   **File & Function/Component:** `contexts/hooks/useConversationManager.ts` -> `handleImportConversations()`
    *   **Purpose:** To read a user-selected JSON file, validate its contents, and merge the valid conversations into the application state.
    *   **Analysis of Changes:** This new function uses a `FileReader` to read the file. The `onload` handler contains the core logic: it parses the text with `JSON.parse` inside a `try...catch`, validates the data structure using a new `isConversationArray` type guard, and then merges the data. It filters out any imported conversations whose IDs already exist in the current state to prevent duplicates.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The `conversations` state is updated by prepending the new, unique conversations from the file. An `alert` notifies the user of success.
        *   **On Failure:** If the file is not valid JSON or doesn't match the expected structure, the `catch` block will trigger, and an `alert` will notify the user of the specific error. The application state will remain unchanged.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** A very large import file could briefly block the main thread during parsing, but this is a minor UX concern for a client-side feature. The data merging strategy (discarding duplicates) is safe and prevents data corruption.
        *   **Checklist Item 1.2 (Validate JSON Parsing):** This is correctly handled by both the `try...catch` block around `JSON.parse` and the subsequent `isConversationArray` validation, making the process robust.

*   **File & Function/Component:** `types/utils.ts` -> `isConversationArray()`
    *   **Purpose:** A type guard to ensure the imported data is an array of objects that look like `Conversation`s.
    *   **Analysis of Changes:** This new function checks if the input is an array and then if every element in the array has the key properties (`id`, `title`, `messages`).
    *   **Predicted Behavior & Outputs:** Returns `true` for valid data, `false` otherwise.
    *   **Identified Risks & Checklist Violations:** The check is basic (it doesn't validate the types of the properties, just their existence). This is sufficient for preventing major errors and is a good balance of safety and complexity for this feature. No checklist violations.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: A valid conversation file is imported**
*   **Given:** The `useConversationManager` hook has one existing conversation with ID "1".
*   **And:** A file is imported containing two valid conversations with IDs "2" and "3".
*   **When:** The `handleImportConversations` function is called with the file.
*   **Then:** The `setConversations` function should be called.
*   **And:** The new conversations state should contain three conversations with IDs "1", "2", and "3".
*   **And:** A success alert should be triggered.

**Scenario: An imported file with duplicate IDs is handled correctly**
*   **Given:** The `useConversationManager` hook has one existing conversation with ID "1".
*   **And:** A file is imported containing two conversations with IDs "1" and "2".
*   **When:** The `handleImportConversations` function is called.
*   **Then:** The new conversations state should contain two conversations with IDs "1" and "2". The existing "1" is kept, the imported "1" is discarded, and "2" is added.
*   **And:** A success alert should be triggered.

**Scenario: An invalid JSON file is imported**
*   **Given:** The user selects a file that contains malformed JSON text (e.g., `[{"id": "1",]}`).
*   **When:** The `handleImportConversations` function is called.
*   **Then:** The `setConversations` function should NOT be called.
*   **And:** An error alert should be triggered, containing a message about an invalid file format.

**Scenario: A valid JSON file with the wrong data structure is imported**
*   **Given:** The user selects a file containing a valid JSON object that is not an array of conversations (e.g., `{"name": "test"}`).
*   **When:** The `handleImportConversations` function is called.
*   **Then:** The `setConversations` function should NOT be called.
*   **And:** An error alert should be triggered with a message about the invalid structure.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Happy Path - Export and Re-import**
*   **Objective:** Verify the full backup and restore cycle works correctly.
*   **Steps:**
    1.  Create 2-3 conversations and have a short chat in each one.
    2.  Go to "Settings".
    3.  Click "Export All Conversations". Save the `.json` file.
    4.  Delete one of the conversations from the UI.
    5.  In Settings, click "Import Conversations" and select the file you just saved.
*   **Expected Result:**
    *   A JSON file is successfully downloaded.
    *   After import, a success alert appears.
    *   The deleted conversation reappears in the conversation list, fully restored with its message history.

**Test Case 2: Import a malformed JSON file**
*   **Objective:** Ensure the application handles invalid files gracefully.
*   **Setup:** Create a text file, name it `bad.json`, and type `this is not json`.
*   **Steps:**
    1.  Go to "Settings".
    2.  Click "Import Conversations" and select `bad.json`.
*   **Expected Result:** An error alert appears, indicating that the file is not valid JSON. No changes are made to the existing conversations. The application remains stable.

**Test Case 3: Import a JSON file with incorrect data structure**
*   **Objective:** Ensure the application's validator rejects valid JSON that doesn't match the expected conversation structure.
*   **Setup:** Create a text file, name it `wrong_structure.json`, and type `[{"foo": "bar"}]`.
*   **Steps:**
    1.  Go to "Settings".
    2.  Click "Import Conversations" and select `wrong_structure.json`.
*   **Expected Result:** An error alert appears, indicating an invalid file format or structure. No changes are made to the existing conversations.

**Test Case 4: Verify duplicate conversations are not imported**
*   **Objective:** Confirm that importing a backup file multiple times does not create duplicate entries.
*   **Steps:**
    1.  Create a conversation titled "Original".
    2.  Export the conversations.
    3.  Import the same backup file again.
*   **Expected Result:** A success alert appears, but the number of conversations in the list does not increase. The "Original" conversation is not duplicated.
