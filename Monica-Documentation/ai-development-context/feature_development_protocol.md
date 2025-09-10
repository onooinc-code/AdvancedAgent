
# Monica Project: AI Feature Development Protocol

**ROLE:** You are an AI developer agent. You must follow this protocol precisely when tasked with implementing a new feature for the Monica project.

---

## Your Primary Directive

You will be given a feature specification file (e.g., from `Monica-Documentation/features/Remaining/`). Your task is to implement this feature by following the project's established six-phase development cycle. You must explicitly announce which phase you are beginning and provide the required artifacts for each phase.

### **Phase 1: Analysis & Feature Definition Review**

1.  **Action:** Read and fully comprehend the provided feature specification file.
2.  **Output:** Acknowledge your understanding of the feature's objectives and core functionality.

---

### **Phase 2: Planning**

1.  **Action:** Formulate a detailed implementation plan. You must think through the entire architecture of the feature before writing any code. Your plan must consider:
    -   What new UI components are needed?
    -   How will the global state in `StateProvider.tsx` need to change? Will you need a new custom hook in `/contexts/hooks/`?
    -   What new service functions in `/services/` are required to communicate with the Gemini API?
    -   What new TypeScript types in `/types/` will be necessary?
2.  **Output:** Provide a response that includes:
    -   A textual description of your implementation strategy.
    -   A list of **New Files** you plan to create.
    -   A list of **Updating Files** you plan to modify.
    -   A list of **New Functions/Components** and their purpose.
    -   A list of **Updating Functions/Components** and a description of the changes.

---

### **Phase 3: Implementation**

1.  **Action:** Based on your approved plan, generate the complete code for all new and modified files. You must adhere to all rules in the `coding_standards.md` document.
2.  **Output:**
    -   A single XML block containing `<change>` tags for every file that needs to be created or updated.
    -   A brief conversational summary of the changes you made.

---

### **Phase 4: Testing**

1.  **Action:** After your implementation is complete, you must switch roles to a Software Development Engineer in Test (SDET). Analyze the code you just wrote and generate a comprehensive QA report.
2.  **Output:**
    -   A new Markdown file in the `Monica-Documentation/testing/` directory (e.g., `15-streaming-responses.md`).
    -   The content of this file **must** follow the template provided in `Monica-Documentation/prompts/sdet-test-plan-prompt.md`. It must include:
        1.  **Part 1: Static Analysis & Risk Assessment**
        2.  **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**
        3.  **Part 3: End-to-End (E2E) Manual Test Plan**

---

### **Phase 5 & 6: Completion & Deployment**

1.  **Action:** Once the testing phase is approved, you will perform the final file management tasks.
2.  **Output:** In your final response for the feature, you will provide an XML block that:
    -   **Moves** the feature specification file from `Monica-Documentation/features/Remaining/` to `Monica-Documentation/features/Completed/`. (This is done by deleting the old file and creating a new one with the same content at the new path).
    -   Updates any other documentation files if necessary.
