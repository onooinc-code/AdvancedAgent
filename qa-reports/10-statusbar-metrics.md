
# QA Report: Feature 10 - Status Bar Metrics

**Feature Description:** Provide an at-a-glance overview of key statistics related to the current conversation and overall API usage.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `services/utils/tokenCounter.ts` -> `estimateTokens()`
    *   **Purpose:** Provides a client-side estimation of the token count for a given message.
    *   **Analysis of Changes:** This is a new, pure function. It calculates tokens based on text length and adds a fixed cost for images.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Returns a positive integer representing the estimated token count.
        *   **On Failure:** As a simple mathematical function, it's not expected to fail.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The estimation (`text.length / 4`) is an approximation and will not perfectly match the official token count from the backend model. This is an acceptable trade-off for a client-side metric and should be documented as an "estimate". No checklist violations.

*   **File & Function/Component:** `contexts/hooks/useUsageTracker.ts`
    *   **Purpose:** Manages the lifecycle of usage metrics, including persistence to local storage.
    *   **Analysis of Changes:** This new hook uses `useLocalStorage`. The `logUsage` function updates both the total token count and a daily breakdown.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** When `logUsage` is called, it correctly updates the `UsageMetrics` object in React state and persists it to `localStorage`. It handles creating a new entry for the current day if one doesn't exist.
        *   **On Failure:** `localStorage` can fail if the user's browser is in private mode or storage is full. The `useLocalStorage` hook has basic `try...catch` blocks, which is good, but a failure would mean usage is not persisted across sessions.
    *   **Identified Risks & Checklist Violations:**
        *   **Checklist Item 1.2:** The hook reads from `localStorage` using `JSON.parse`. This is wrapped in a `try...catch` inside `useLocalStorage`, which is correct and prevents crashes from corrupted data.

*   **File & Function/Component:** `contexts/hooks/useChatHandler.ts` -> `handleSendMessage` etc.
    *   **Purpose:** To trigger the logging of token usage after an AI interaction.
    *   **Analysis of Changes:** After a successful AI response is received, it calls the `logUsage` function with the estimated tokens for both the user's prompt and the AI's response.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The `logUsage` function is called with a positive integer.
        *   **On Failure:** If the AI call fails, `logUsage` is not called, which is correct as no tokens were successfully consumed.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** Token usage is only logged after a *successful* response. If an API call fails but still incurs cost (unlikely but possible), it wouldn't be tracked. This is an acceptable limitation of the client-side implementation. No checklist violations.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: Token estimation for a text-only message**
*   **Given:** A message object with text "Hello world".
*   **When:** The `estimateTokens` function is called with the message.
*   **Then:** It should return `3` (since 11 chars / 4 = 2.75, rounded up).

**Scenario: Token estimation for a message with an image**
*   **Given:** A message object with text "Look at this" and an attachment.
*   **When:** The `estimateTokens` function is called with the message.
*   **Then:** It should return `262` (12 chars / 4 = 3, plus 258 for the image, plus 1 for the text). Wait, (12/4) = 3. Plus 258. Is it 261? `Math.ceil(12/4) = 3`. Okay, 261. Let's recheck. "Look at this" is 12 chars. `ceil(12/4) = 3`. 3 + 258 = 261. My initial math was wrong.
*   **Then:** It should return `261` (`ceil(12/4)` = 3 for text, + 258 for the image).

**Scenario: `logUsage` creates a new daily entry**
*   **Given:** The `useUsageTracker` hook is initialized with an empty `dailyUsage` array.
*   **When:** `logUsage(100)` is called for the first time.
*   **Then:** The `usageMetrics` state should have `totalTokens: 100`.
*   **And:** The `dailyUsage` array should contain one item for today's date with `tokens: 100`.

**Scenario: `logUsage` updates an existing daily entry**
*   **Given:** `usageMetrics` already has an entry for today with `tokens: 150`. The `totalTokens` is 500.
*   **When:** `logUsage(50)` is called.
*   **Then:** The `usageMetrics` state should have `totalTokens: 550`.
*   **And:** The `dailyUsage` entry for today should be updated to have `tokens: 200`.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Verify status bar updates on new message**
*   **Objective:** Confirm that the conversation metrics in the status bar update in real-time.
*   **Steps:**
    1.  Start a new conversation. Observe the status bar shows "Messages: 0" and "Tokens: 0" for the conversation.
    2.  Send a message: "Hello".
    3.  Wait for the AI to respond.
*   **Expected Result:** After the AI responds, the status bar should update. The "Messages" count should now be 2. The "Tokens" count should be a positive number, reflecting the estimated tokens for both messages.

**Test Case 2: Verify global usage metrics are persistent**
*   **Objective:** Confirm that the global usage data is saved and loaded correctly across sessions.
*   **Steps:**
    1.  Have a short conversation with the AI. Note the "Today" and "Total" token counts in the status bar.
    2.  Reload the entire application (F5 or refresh button).
    3.  Select the same conversation.
*   **Expected Result:** After reloading, the "Today" and "Total" token counts in the status bar should be the same as they were before the reload.

**Test Case 3: Verify metrics with image attachments**
*   **Objective:** Confirm that image attachments are correctly included in token estimates.
*   **Steps:**
    1.  Start a new conversation. Note the initial token count (0).
    2.  Attach an image and send it with no text.
    3.  Wait for the AI response.
*   **Expected Result:** The conversation token count should increase by a significant amount (over 258), reflecting the cost of the image in the user's prompt. The global token counters should also increase accordingly.
