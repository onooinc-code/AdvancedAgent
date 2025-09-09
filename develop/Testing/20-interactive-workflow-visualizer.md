
# QA Report: Feature 20 - Interactive Workflow Visualizer

**Feature Description:** Provide a clear, graphical representation of the AI's decision-making and response process for each turn.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `components/CognitiveInspectorModal.tsx`
    *   **Purpose:** To display the AI's backend `pipeline` data as a graphical, vertical timeline.
    *   **Analysis of Changes:** The component's rendering logic was completely overhauled. It now maps over the `inspectorData` to create a series of nodes connected by a timeline track. It uses local state (`openStepIndex`) to manage which step's details are currently expanded. The title has been changed to "Workflow Visualizer".
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** Renders a visually appealing and easy-to-understand timeline of the AI's process. Clicking a step header will expand/collapse its details (input/output). The first step is expanded by default for immediate insight.
        *   **On Failure:** If `inspectorData` is null or empty, it will simply render an empty container, which is a graceful failure.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** The UI relies on absolute positioning for the timeline dot and track. This can sometimes be brittle with complex CSS, but the implementation is straightforward and unlikely to cause issues. No checklist violations.

*   **File & Function/Component:** `components/MessageBubble.tsx`
    *   **Purpose:** To provide the UI trigger to open the new workflow visualizer.
    *   **Analysis of Changes:** The button for inspecting the pipeline has been updated. It now uses the new `SitemapIcon` and has more user-friendly text ("View Workflow"). The underlying `onClick` handler (`openInspectorModal`) remains the same, as the state management logic was not changed.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The new icon and tooltip are displayed on AI messages that have pipeline data. Clicking it opens the revamped modal.
    *   **Identified Risks & Checklist Violations:** No risks. This is a minor, low-risk UI change.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: Modal renders a timeline with multiple steps**
*   **Given:** The `CognitiveInspectorModal` is opened with `inspectorData` containing three pipeline steps.
*   **When:** The component renders.
*   **Then:** The modal should contain three timeline nodes.
*   **And:** A vertical line element should be present, connecting the nodes.
*   **And:** The details for the first step (index 0) should be visible by default.
*   **And:** The details for the second and third steps should be hidden.

**Scenario: User can expand and collapse timeline steps**
*   **Given:** The modal is open with the first step's details visible.
*   **When:** The user clicks the header of the second step.
*   **Then:** The details for the first step should become hidden.
*   **And:** The details for the second step should become visible.
*   **When:** The user clicks the header of the second step again.
*   **Then:** The details for the second step should become hidden again.

**Scenario: `MessageBubble` shows the new workflow button**
*   **Given:** A `MessageBubble` component receives an AI message containing a non-empty `pipeline` array.
*   **When:** The component renders its toolbar.
*   **Then:** The toolbar should contain a button with the title "View Workflow".
*   **And:** That button should contain the `SitemapIcon` component, not the `InspectIcon` component.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Verify visualizer happy path**
*   **Objective:** Confirm that the new workflow visualizer opens and displays data correctly.
*   **Steps:**
    1.  Have a conversation with an AI agent.
    2.  Hover over the AI's response message to show the toolbar.
    3.  Click the "View Workflow" button (it looks like a small flowchart).
*   **Expected Result:** A modal titled "Workflow Visualizer" opens. It displays a vertical timeline with at least two steps (e.g., "Context Assembly" and "Model Invocation"). The first step's details (Input/Output) are expanded by default.

**Test Case 2: Interact with the timeline**
*   **Objective:** Ensure the expand/collapse functionality of the timeline is working.
*   **Steps:**
    1.  With the Workflow Visualizer open, observe that the first step is expanded.
    2.  Click the header of the second step in the timeline.
    3.  Click the header of the first step.
    4.  Click the header of the first step again to collapse it.
*   **Expected Result:**
    *   After step 2, the second step's details expand, and the first step's details collapse.
    *   After step 3, the first step's details expand, and the second step's details collapse.
    *   After step 4, the first step's details collapse, leaving no steps expanded.

**Test Case 3: Verify visualizer for a multi-step dynamic plan**
*   **Objective:** Ensure the visualizer can handle a longer, more complex pipeline from a dynamic plan.
*   **Steps:**
    1.  Switch to "Dynamic" mode.
    2.  Send a complex prompt that generates a multi-step plan (e.g., "Analyze this data and then summarize it").
    3.  After the full response is complete, find the final AI message in the sequence.
    4.  Open the Workflow Visualizer for that final message.
*   **Expected Result:** The timeline should be longer, containing multiple "Model Invocation" steps, one for each part of the executed plan. The visualizer should render all steps correctly.