# Advanced AI Assistant

> An advanced AI assistant that allows you to chat with multiple AI agents in the same conversation. Manage the dialogue flow with an AI manager or manual suggestions, configure agent behaviors, and view a structured chat history.

This application serves as a powerful and flexible platform for multi-agent AI conversations. It features a sophisticated architecture that allows for dynamic, AI-driven conversation flows, persistent memory, and deep introspection into the AI's cognitive processes. It is designed for both casual users and developers who need a transparent and configurable AI chat environment.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Design Principles](#design-principles)
3. [Development Cycle](#development-cycle)
4. [Communication Protocol](#communication-protocol)
5. [Getting Started](#getting-started)
6. [Technology Stack](#technology-stack)
7. [Configuration](#configuration)
8. [Future Improvements](#future-improvements)

---

## 1. Project Structure

This project follows a feature-oriented architecture designed for scalability and maintainability.

```
/
├── components/         # Reusable UI components (Modals, Inputs, etc.)
│   └── icons/          # SVG icon components
├── constants.ts        # Global constants (default agents, configs)
├── contexts/           # React context for state management
│   ├── hooks/          # Custom hooks for logic domains (chat, history, etc.)
│   └── StateProvider.tsx # Main context provider
├── develop/            # Development planning and QA assets
│   ├── Completed/      # Feature definition files (Completed)
│   ├── Remaining/      # Feature definition files (To-Do)
│   └── Testing/        # QA reports and test plans
├── hooks/              # General-purpose custom React hooks (e.g., useLocalStorage)
├── services/           # External API interactions
│   ├── analysis/       # Services that analyze conversation content (history, memory)
│   ├── chat/           # Services that manage the chat flow
│   ├── creation/       # Services for AI-powered generation (teams, rules)
│   ├── gemini/         # Core client for the Gemini API
│   └── utils/          # Shared utility functions for services
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

---

## 2. Design Principles

-   **Single Responsibility Principle (SRP)**: Every file, from components to services, is designed to perform a single, atomic function. This enhances testability and reduces complexity.
-   **Clean & Decoupled Architecture**: Logic is separated by its domain (UI, state, services). `StateProvider.tsx` acts as an orchestrator, assembling decoupled logic from custom hooks (`useChatHandler`, `useConversationManager`, etc.) into a cohesive whole.
-   **Type Safety**: The project is written in TypeScript to catch errors during development and improve code quality and maintainability.

---

## 3. Development Cycle

We follow a structured, three-phase, feature-driven development process to ensure clarity, quality, and traceability.

1.  **Feature Definition**: A new feature is defined in a `.txt` file and placed in `develop/Remaining/`. This file acts as the single source of truth for the feature's requirements.
2.  **Implementation**: The developer implements the feature according to the specification.
3.  **Testing**: A comprehensive QA test plan is generated and stored in `develop/Testing/`. The feature is rigorously tested against the plan.
4.  **Completion**: Once implemented and tested, the feature's definition file is moved from `develop/Remaining/` to `develop/Completed/`. This provides a clear, auditable history of the project's progress.

---

## 4. Communication Protocol

To streamline our development process, we use a simple communication shorthand:

-   **Sending a single period (`.`)**: When the project lead sends a message containing only a period, it signifies that the previous response has been reviewed, approved, and that development should proceed to the next planned feature or task.

---

## 5. Getting Started

### Prerequisites

-   A modern web browser.
-   A deployment environment capable of serving static files (`index.html`) and providing environment variables.

### Running the Application

The application is designed to be run in a web-based development environment.
1.  Ensure the `API_KEY` environment variable is set in your environment.
2.  The environment should serve the `index.html` file as the main entry point. The application's JavaScript modules will be loaded automatically.

---

## 6. Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Services**: Google Gemini API (`@google/genai`)
-   **State Management**: React Context with Custom Hooks
-   **Dependencies**: `marked` (Markdown parsing), `dompurify` (HTML sanitization), `highlight.js` (syntax highlighting)

---

## 7. Configuration

Application configuration is managed through an environment variable.

-   **`API_KEY`**: Your Google Gemini API key. This is a **required** variable for the application to function. It must be available as `process.env.API_KEY`.

---

## 8. Future Improvements

-   **Formal Unit & Integration Testing**: Introduce a testing framework like **Vitest** or **React Testing Library**. The test scenarios already defined in our `develop/Testing` reports provide a perfect starting point for writing these tests.
-   **Advanced State Management**: For even larger applications, migrating from `useLocalStorage` for core state to a dedicated state management library like **Zustand** or **Redux Toolkit** would provide better performance and developer tools.
-   **CI/CD Pipeline**: Implement a Continuous Integration/Continuous Deployment pipeline (e.g., using GitHub Actions) to automatically test and deploy changes.
-   **WebSocket for Real-time Updates**: For multi-user scenarios, integrate WebSockets to synchronize state across clients in real-time.
