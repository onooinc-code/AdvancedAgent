# QA Report: Feature 13 - Advanced Agent Configuration

**Feature Description:** Enhance the agent configuration screen to allow for more detailed and structured agent definitions, including a persistent knowledge base.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `components/SettingsModal.tsx` -> `handleAgentChange()`
    *   **Purpose:** Updates the local state for an agent when a user edits a form field.
    *   **Analysis of Changes:** The function was updated to handle new fields, including `goals` and `specializations`, which are textareas that need to be converted to `string[]`. The logic `e.target.value.split('\n')` is used for this conversion.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** When the user types in the "Goals" textarea, the `onChange` event splits the string by newlines and correctly updates the `goals` array in the `localAgents` state.
        *   **On Failure:** If the user enters a very large amount of text, there could be a minor performance lag, but this is unlikely to cause a failure.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The `split('\n')` can result in empty strings in the array if the user has blank lines (e.g., "Goal 1\n\nGoal 2" becomes `['Goal 1', '', 'Goal 2']`). This is a minor data cleanliness issue but won't break the app. No checklist violations.

*   **File & Function/Component:** `services/chat/agentService.ts` -> `generateResponse()`
    *   **Purpose:** To generate a response from an AI agent, now including background knowledge.
    *   **Analysis of Changes:** A new block of logic was added at the beginning. It checks if `agent.knowledge` exists and, if so, prepends it to the `systemInstruction` with clear delimiters (`--- BACKGROUND KNOWLEDGE ---`).
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The call to `ai.models.generateContent` will receive a `systemInstruction` in its `config` that contains both the provided knowledge and the original instruction. This should lead to more contextually aware responses.
        *   **On Failure:** If `agent.knowledge` is null or an empty string, the logic is skipped, and the original `systemInstruction` is used, which is correct.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** A very large knowledge base could significantly increase the prompt size and token cost. This is a user-controlled risk. The prompt construction itself is safe. No checklist violations.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: User updates an agent's knowledge base**
*   **Given:** The `SettingsModal` is open.
*   **And:** A user types "The secret code is 1234." into the "Knowledge Base" textarea for `agent-1`.
*   **When:** The user clicks the "Save Changes" button.
*   **Then:** The `setAgents` function should be called with an updated agents array where `agent-1`'s `knowledge` property is "The secret code is 1234.".

**Scenario: `generateResponse` correctly uses the knowledge base**
*   **Given:** An `Agent` object with `systemInstruction: "You are a helpful assistant."` and `knowledge: "The secret code is 1234."`.
*   **And:** The `generateResponse` function in `agentService` is called with this agent.
*   **When:** The `ai.models.generateContent` function is about to be called.
*   **Then:** The `systemInstruction` property within its `config` parameter should start with `You have the following background knowledge...` and contain the text "The secret code is 1234.".

**Scenario: User updates agent goals with multiple lines**
*   **Given:** The `SettingsModal` is open.
*   **And:** A user types "First Goal\nSecond Goal" into the "Goals" textarea for `agent-1`.
*   **When:** The user clicks the "Save Changes" button.
*   **Then:** The `setAgents` function should be called with an updated agents array where `agent-1`'s `goals` property is the array `['First Goal', 'Second Goal']`.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Verify Knowledge Base affects agent responses**
*   **Objective:** Confirm that information provided in the Knowledge Base is used by the agent.
*   **Steps:**
    1.  Open the main "Settings" modal.
    2.  Find the "Creative Writer" agent.
    3.  In its "Knowledge Base" textarea, enter: `The main character of our story is a brave knight named Sir Reginald. His quest is to find the Sunstone.`
    4.  Click "Save Changes".
    5.  Start a new chat.
    6.  Send the message to the Creative Writer (either in Manual mode or if AI mode selects them): `What is my character's name and what is he looking for?`
*   **Expected Result:** The Creative Writer should respond with something like, "Your character's name is Sir Reginald, and he is on a quest to find the Sunstone." The agent should know this information without it being in the immediate chat history.

**Test Case 2: Verify all new fields are saved and persist**
*   **Objective:** Ensure all new advanced configuration fields are saved correctly and are retained after a page reload.
*   **Steps:**
    1.  Open the "Settings" modal.
    2.  For the "Technical Analyst" agent, fill in all the new fields:
        *   **Role:** "Fact-checker"
        *   **Goals:** `Verify information\nProvide sources\nCorrect inaccuracies`
        *   **Specializations:** `Web research\nFact-checking`
        *   **Knowledge Base:** `The capital of France is Paris.`
    3.  Click "Save Changes".
    4.  Reload the application (F5).
    5.  Open the "Settings" modal again and inspect the "Technical Analyst".
*   **Expected Result:** All the fields you entered in step 2 should still be present and correctly populated. The "Goals" and "Specializations" textareas should still have the multiple lines of text.

**Test Case 3: Verify that an empty knowledge base has no effect**
*   **Objective:** Confirm that if the knowledge base is empty, the agent's behavior is unchanged.
*   **Steps:**
    1.  Open "Settings".
    2.  Ensure the "Empathetic Counselor" agent has an empty "Knowledge Base" field. Save changes if needed.
    3.  In a chat, ask the agent a question: "What is the capital of France?"
*   **Expected Result:** The agent should give a general, non-committal, or empathetic response, stating that it may not know or that's outside its expertise (e.g., "That sounds like an interesting question, but my focus is on helping you with your feelings. Perhaps we can explore why that's on your mind?"). It should not know the capital of France.