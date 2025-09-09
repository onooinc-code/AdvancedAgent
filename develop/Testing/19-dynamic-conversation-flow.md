# QA Report: Feature 19 - Dynamic Conversation Flow

**Feature Description:** Allow the AI Manager to dynamically create and execute a multi-step plan for each turn, deciding which agent(s) should speak and in what order.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `services/chat/managerService.ts` -> `generateDynamicPlan()`
    *   **Purpose:** To call the Gemini API with a detailed prompt asking it to formulate a multi-step plan based on the user's request.
    *   **Analysis of Changes:** This new function constructs a prompt including agent profiles and conversation history. It uses a strict `responseSchema` to request a JSON array of `PlanStep` objects.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Returns a promise resolving to an object containing the `result` (an array of plan steps) and the `pipeline` for inspection.
        *   **On Failure:** If the API fails or returns malformed JSON, the `catch` block logs the error and returns an empty array, which is handled by the calling function.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The quality of the plan is entirely dependent on the model's ability to understand the prompt. A poorly formed plan could lead to illogical agent actions. This is an inherent risk of AI-driven logic.
        *   **Checklist Item 1.2 (Validate JSON Parsing):** This is correctly handled by a `try...catch` block. The use of `responseSchema` is a strong mitigation against receiving invalid JSON.

*   **File & Function/Component:** `services/chat/agentService.ts` -> `generateResponse()`
    *   **Purpose:** To generate a response from an agent, now with a specific task for the turn.
    *   **Analysis of Changes:** The function signature was updated to accept an optional `task?: string`. This task is then prepended to the user-facing prompt, giving the agent a direct instruction for its turn.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The agent's response should be more focused and directly address the `task` it was given.
        *   **On Failure:** If `task` is undefined, the function behaves as it did before, using `latestText`, which is correct.
    *   **Identified Risks & Checklist Violations:** No risks. The change is simple and backward-compatible.

*   **File & Function/Component:** `contexts/hooks/useChatHandler.ts` -> `handleSendMessage()` (Dynamic Mode block)
    *   **Purpose:** To orchestrate the entire dynamic flow: get plan, display plan, execute plan.
    *   **Analysis of Changes:** This is a major new logic path. It first calls `generateDynamicPlan`. If a valid plan is received, it creates a special system `Message` object with the `plan` data attached. It then enters a `for` loop to execute each step, sequentially calling `generateResponse` for the correct agent and passing the specific `task`.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The UI will show the user's message, then the Manager's plan message, then a sequence of agent responses, with status updates for each step.
        *   **On Failure:** If plan generation returns an empty array, it correctly adds a system error message and stops. If an agent fails mid-plan, the `try...catch` block will catch it and the `finally` block will reset the loading state.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The sequential `await`ing in the `for` loop means a slow agent response will block subsequent steps. This is the intended behavior for a sequential plan. No checklist violations. The logic is complex but appears sound.

*   **File & Function/Component:** `components/MessageBubble.tsx` & `components/PlanDisplay.tsx`
    *   **Purpose:** To render the new plan-type message.
    *   **Analysis of Changes:** `MessageBubble` now conditionally renders the new `PlanDisplay` component if `message.plan` exists. `PlanDisplay` is a new component that maps over the plan steps and displays them in a formatted list.
    *   **Predicted Behavior & Outputs:** A system message containing a plan will be rendered as a clear, easy-to-read, ordered list.
    *   **Identified Risks & Checklist Violations:** No risks. This is a display-only component.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: A valid dynamic plan is generated and executed**
*   **Given:** The `useChatHandler` is in 'Dynamic' mode.
*   **And:** `ManagerService.generateDynamicPlan` is mocked to return a plan with two steps for `agent-1` and `agent-2`.
*   **When:** `handleSendMessage` is called.
*   **Then:** A system message containing the plan should be added to the conversation.
*   **And:** `AgentService.generateResponse` should be called for `agent-1` with the task from step 1.
*   **And:** After `agent-1` completes, `AgentService.generateResponse` should be called for `agent-2` with the task from step 2.

**Scenario: Dynamic plan generation fails**
*   **Given:** The `useChatHandler` is in 'Dynamic' mode.
*   **And:** `ManagerService.generateDynamicPlan` is mocked to return an empty plan array.
*   **When:** `handleSendMessage` is called.
*   **Then:** A system message should be added to the conversation stating that a plan could not be formulated.
*   **And:** No calls to `AgentService.generateResponse` should be made.

**Scenario: Plan execution fails mid-way**
*   **Given:** A dynamic plan with two steps is being executed.
*   **And:** The call to `AgentService.generateResponse` for the first step succeeds.
*   **And:** The call to `AgentService.generateResponse` for the second step is mocked to throw an error.
*   **When:** The plan is executed.
*   **Then:** The `loadingStage` should be correctly reset to `idle`.
*   **And:** The overall `handleSendMessage` function should not crash.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Happy Path - Multi-step plan execution**
*   **Objective:** Verify that the manager can create and execute a plan involving multiple agents.
*   **Steps:**
    1.  Ensure the conversation mode is set to "Dynamic".
    2.  Send a complex request that requires multiple skills, e.g., `Please analyze the following code snippet for potential bugs, and then rewrite it to be more efficient. \`\`\`js\n// some inefficient code here\n\`\`\``
*   **Expected Result:**
    1.  The user's message appears.
    2.  The live status indicator shows "Manager is formulating a plan...".
    3.  A system message appears displaying the Manager's Plan (e.g., Step 1: Technical Analyst - Analyze code for bugs. Step 2: Creative Writer - Rewrite code for efficiency).
    4.  The status indicator shows the Technical Analyst executing its task.
    5.  The Technical Analyst's response (the analysis) appears.
    6.  The status indicator shows the Creative Writer executing its task.
    7.  The Creative Writer's response (the rewritten code) appears.
    8.  The status indicator disappears.

**Test Case 2: Verify single-step plan**
*   **Objective:** Ensure the system works correctly for simple requests that only need one agent.
*   **Steps:**
    1.  Ensure the mode is "Dynamic".
    2.  Send a simple request, e.g., `Tell me a short poem about the ocean.`
*   **Expected Result:**
    1.  A system message with a 1-step plan appears (e.g., Step 1: Creative Writer - Write a poem).
    2.  The Creative Writer responds with a poem. The flow completes successfully.

**Test Case 3: Switch between Dynamic and other modes**
*   **Objective:** Verify that changing modes correctly changes the application's behavior.
*   **Steps:**
    1.  Execute a request in "Dynamic" mode and see the plan.
    2.  Switch the mode to "AI Agent" in the header.
    3.  Send the same request again.
    4.  Switch the mode to "Manual".
    5.  Send the same request again.
*   **Expected Result:**
    *   In "AI Agent" mode, no plan is shown, and only one agent responds directly.
    *   In "Manual" mode, no plan is shown, and the suggestion buttons appear.