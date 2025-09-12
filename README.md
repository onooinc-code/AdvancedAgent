# Monica - Advanced AI Assistant

> An advanced AI assistant that allows you to chat with multiple AI agents in the same conversation. Manage the dialogue flow with an AI manager or manual suggestions, configure agent behaviors, and view a structured chat history.

This application serves as a powerful and flexible platform for multi-agent AI conversations. It features a sophisticated architecture that allows for dynamic, AI-driven conversation flows, persistent memory, and deep introspection into the AI's cognitive processes.

---

## Documentation

**All project documentation has been centralized in the new [Monica Documentation Site](./Monica-Documentation/index.html).**

Please refer to the documentation for detailed information on:
-   Project architecture and design principles
-   The feature-driven development cycle
-   State management patterns
-   The component library and styling guide
-   Future development plans and backend migration strategies

---

## Getting Started

### Prerequisites

-   A modern web browser.
-   A deployment environment capable of serving static files (`index.html`) and providing environment variables.

### Running the Application

1.  Ensure the `API_KEY` environment variable is set in your environment.
2.  The environment should serve the `index.html` file as the main entry point. The application's JavaScript modules will be loaded automatically.

---

## Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Services**: Google Gemini API (`@google/genai`)
-   **State Management**: React Context with Custom Hooks
-   **Dependencies**: `marked`, `dompurify`, `highlight.js`