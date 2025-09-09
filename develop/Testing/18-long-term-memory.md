
# QA Report: Feature 18 - Long-Term Memory

**Feature Description:** Implement a persistent memory system that allows AI agents to recall key facts, entities, and user preferences across different conversations.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `services/analysis/memoryService.ts` -> `extractKeyInformation()`
    *   **Purpose:** Calls the Gemini API to analyze a conversation and extract or update a JSON object of key facts.
    *   **Analysis of Changes:** This new service function constructs a complex prompt that includes the existing memory and recent conversation history. It asks the model to return an updated JSON object.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Returns a promise that resolves to a new JSON object representing the complete, updated memory.
        *   **On Failure:** Catches errors from the API or from `JSON.parse` if the model returns malformed data. It logs the error and re-throws, which is handled by the `StateProvider`.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The model might "forget" existing keys or return a completely different structure. The prompt engineering is crucial here. The current prompt correctly instructs the model to *update* the existing memory, which mitigates this.
        *   **Checklist Item 1.2 (Validate JSON Parsing):** This is correctly handled by a `try...catch` block around `JSON.parse`.

*   **File & Function/Component:** `services/chat/agentService.ts` -> `generateResponse()`
    *   **Purpose:** To inject the long-term memory into an agent's system prompt before generating a response.
    *   **Analysis of Changes:** A new block of code was added that stringifies the `longTermMemory` object and prepends it to the `systemInstruction`.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The final system instruction sent to the model will be a composite string containing the memory, any knowledge base, and the agent's core instructions. The agent's responses should become more contextually aware.
        *   **On Failure:** If `longTermMemory` is an empty object `{}`, the logic is skipped, which is correct.
    *   **Identified Risks & Checklist Violations:** No risks. The string concatenation is safe.

*   **File & Function/Component:** `contexts/hooks/useMemoryManager.ts`
    *   **Purpose:** To manage the state of the long-term memory and persist it to local storage.
    *   **Analysis of Changes:** This is a new hook using `useLocalStorage`.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Provides a stable `longTermMemory` object and a `setLongTermMemory` function that correctly updates both React state and `localStorage`.
    *   **Identified Risks & Checklist Violations:**
        *   **Checklist Item 1.2:** The `useLocalStorage` hook it relies on already contains `try...catch` blocks for JSON parsing, making it safe against corrupted data in `localStorage`.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: Injecting memory into an agent's prompt**
*   **Given:** The `longTermMemory` state is `{ "user_name": "Alex" }`.
*   **And:** An agent with `systemInstruction: "Be helpful."`.
*   **When:** The `agentService.generateResponse` function is called.
*   **Then:** The `systemInstruction` passed to the Gemini API must contain the string `"user_name": "Alex"`.

**Scenario: User extracts memory from a conversation**
*   **Given:** An active conversation where the user has said "My name is Bob."
*   **And:** The current long-term memory is `{ "project": "Website" }`.
*   **And:** The `memoryService.extractKeyInformation` is mocked to return `{ "project": "Website", "user_name": "Bob" }`.
*   **When:** The `handleExtractAndUpdateMemory` function is called.
*   **Then:** The `setLongTermMemory` function should be called with the object `{ "project": "Website", "user_name": "Bob" }`.

**Scenario: User edits and saves memory manually**
*   **Given:** The `SettingsModal` is open.
*   **When:** The user types `{"favorite_color": "blue"}` into the memory textarea.
*   **And:** The user clicks "Save Memory".
*   **Then:** The `setLongTermMemory` function should be called with the object `{ "favorite_color": "blue" }`.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Memory Extraction and Injection Cycle**
*   **Objective:** Verify that the AI can learn a fact from one conversation and recall it in a different one.
*   **Steps:**
    1.  **Learn:** Start a new conversation. Open "Conversation Settings". Ensure "Memory Extraction" is ON. Send the message: `My name is Dr. Evelyn Reed, and I am a particle physicist.`
    2.  Open "Conversation Settings" again and click "Update Memory from this Chat". A success alert should appear.
    3.  **Verify Storage:** Go to the main "Settings" modal. The "Long-Term Memory" textarea should now contain something like `{ "user_name": "Dr. Evelyn Reed", "user_profession": "particle physicist" }`.
    4.  **Recall:** Start a *different* new conversation.
    5.  Send the message: `Hello, what is my name and job?`
*   **Expected Result:** The AI should respond with something like, "Hello, your name is Dr. Evelyn Reed and you are a particle physicist."

**Test Case 2: Manual Memory Editing**
*   **Objective:** Ensure a user can manually add facts to the AI's memory.
*   **Steps:**
    1.  Go to the main "Settings" modal.
    2.  In the "Long-Term Memory" textarea, type: `{ "project_code_name": "Odyssey" }`.
    3.  Click "Save Memory". A success alert should appear.
    4.  Start a new conversation.
    5.  Ask the AI: `What is the current project's code name?`
*   **Expected Result:** The AI should respond with "The project's code name is Odyssey."

**Test Case 3: Clear Memory**
*   **Objective:** Verify that the "Clear Memory" button works as expected.
*   **Steps:**
    1.  Ensure there is data in the long-term memory (by following steps from a previous test case).
    2.  Go to the main "Settings" modal.
    3.  Click "Clear Memory". A confirmation dialog appears. Click "OK".
    4.  The textarea should now show `{}`.
    5.  Start a new conversation and ask a question that relies on the old memory (e.g., "What is my name?").
*   **Expected Result:** The AI should state that it does not know your name.
