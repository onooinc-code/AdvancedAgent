# QA Report: Feature 04 - Rich Message Content

**Feature Description:** Enhance messages by supporting rich formatting (Markdown), code syntax highlighting, and secure previewing of generated HTML.

---

### **Part 1: Static Analysis & Risk Assessment**

*   **File & Function/Component:** `components/MessageBubble.tsx`
    *   **Purpose:** Renders the message content, applying Markdown parsing and syntax highlighting.
    *   **Analysis of Changes:** This component uses third-party libraries (`marked`, `DOMPurify`, `highlight.js`). The core logic is in a `useEffect` hook that runs after the component renders to manipulate the DOM.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The `dangerouslySetInnerHTML` prop is used to inject HTML parsed from Markdown. The `useEffect` then finds `pre code` blocks and applies highlighting. It also dynamically injects a toolbar for code blocks.
        *   **On Failure:** If `marked` or `DOMPurify` fail, it could result in an error or unformatted text. If `hljs` fails, code won't be highlighted.
    *   **Identified Risks & Checklist Violations:**
        *   **Risk 1:** The primary risk is XSS from user-injected content. This is correctly mitigated by wrapping the `marked.parse()` output in `DOMPurify.sanitize()`. This is a critical security step and is implemented correctly.
        *   **Risk 2:** The DOM manipulation in `useEffect` to add the toolbar is slightly brittle. If `marked` changes the HTML structure it generates for code blocks in a future version, the toolbar injection logic might break. This is an acceptable risk for now. No checklist violations.

*   **File & Function/Component:** `components/HtmlPreviewModal.tsx`
    *   **Purpose:** Displays user-provided HTML content in a safe environment.
    *   **Analysis of Changes:** Renders an `iframe` component.
    *   **Predicted Behavior & Outputs:**
        *   **On Success:** The HTML string from `htmlPreviewContent` is passed to the `srcDoc` attribute of the `iframe`. The `sandbox=""` attribute is applied.
        *   **On Failure:** n/a
    *   **Identified Risks & Checklist Violations:**
        *   **Risk:** Rendering arbitrary HTML is inherently dangerous. The use of a sandboxed `iframe` (`sandbox=""`) is the industry-standard best practice to mitigate this. It prevents the code inside the iframe from executing scripts, accessing parent window objects, or making API calls, effectively neutralizing XSS and other attacks. This is implemented correctly. No checklist violations.

---

### **Part 2: Unit & Integration Test Scenarios (Gherkin Syntax)**

**Scenario: Message with Markdown is rendered correctly**
*   **Given:** A `MessageBubble` component receives a message with text: `This is **bold** and this is a list:\n- Item 1\n- Item 2`.
*   **When:** The component renders.
*   **Then:** The output HTML should contain a `<strong>` tag.
*   **And:** The output HTML should contain a `<ul>` with two `<li>` tags.

**Scenario: Code block gets a toolbar and highlighting**
*   **Given:** A `MessageBubble` component receives a message with text: "```javascript\nconst x = 1;\n```".
*   **When:** The component's `useEffect` hook completes.
*   **Then:** The rendered `pre` element should have a sibling `div` with the class `code-toolbar`.
*   **And:** The `code` element inside should have classes applied by `highlight.js` (e.g., `hljs`, `language-javascript`).

**Scenario: HTML preview modal is opened securely**
*   **Given:** The `handleShowHtmlPreview` function is called with the string `<button>Click Me</button>`.
*   **When:** The `HtmlPreviewModal` component becomes visible.
*   **Then:** The modal should contain an `iframe` element.
*   **And:** The `iframe` element must have the `sandbox` attribute.

---

### **Part 3: End-to-End (E2E) Manual Test Plan**

**Test Case 1: Verify Markdown rendering**
*   **Objective:** Confirm that various Markdown syntaxes are parsed and displayed correctly.
*   **Steps:**
    1.  Send a message containing the following text:
        ```markdown
        # Header 1
        This is **bold text**. This is *italic text*.
        - List item 1
        - List item 2
        > This is a blockquote.
        ```
*   **Expected Result:** The message bubble in the chat displays the text with proper HTML formatting: a large header, bold and italic text, a bulleted list, and an indented blockquote.

**Test Case 2: Verify code block syntax highlighting**
*   **Objective:** Confirm that fenced code blocks are highlighted.
*   **Steps:**
    1.  Ask the AI: "Write a simple hello world function in Python."
*   **Expected Result:** The AI responds with a code block (e.g., `def hello():\n  print("Hello, World!")`). The code block should have a dark background, and the keywords (`def`, `print`) and string should be different colors. The toolbar above should correctly identify the language as "python".

**Test Case 3: Verify secure HTML preview**
*   **Objective:** Confirm that generated HTML can be previewed safely.
*   **Steps:**
    1.  Ask the AI: "Generate the HTML for a red button that says 'Click Me'."
    2.  The AI will respond with an HTML code block. Hover over the block to see the toolbar.
    3.  Click the "View HTML" button on the toolbar.
*   **Expected Result:** A modal window opens, displaying a rendered red button with the text "Click Me". The application itself remains unchanged.

**Test Case 4: Verify HTML preview sandbox security**
*   **Objective:** Confirm that malicious scripts in the HTML preview are not executed.
*   **Steps:**
    1.  Ask the AI: "Generate HTML for a button and include a javascript alert that says 'hacked'." (e.g., `<script>alert('hacked')</script><button>Test</button>`).
    2.  Click the "View HTML" button.
*   **Expected Result:** The modal opens and displays the button. The `alert('hacked')` JavaScript popup **DOES NOT** appear. This proves the sandbox is working correctly.
