# [Project Title]

> A brief, one-sentence description of what this project does.

This is a longer description providing more context on the project's purpose, key features, and the problems it solves.

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
├── components/         # Reusable UI components
├── contexts/           # State management and shared logic
├── develop/            # Development planning and QA assets
│   ├── Completed/      # Feature definition files (Completed)
│   ├── Remaining/      # Feature definition files (To-Do)
│   └── Testing/        # QA reports and test plans
├── services/           # External API interactions (e.g., databases, external APIs)
├── types/              # TypeScript type definitions
├── utils/              # Shared utility functions
├── public/             # Static assets (images, fonts)
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

---

## 2. Design Principles

-   **Single Responsibility Principle (SRP)**: Every file, from components to services, is designed to perform a single, atomic function. This enhances testability and reduces complexity.
-   **Clean & Decoupled Architecture**: Logic is separated by its domain (UI, state, services). This prevents tight coupling and allows for easier refactoring.
-   **Type Safety**: The project is written in TypeScript to catch errors during development and improve code quality and maintainability.

---

## 3. Development Cycle

We follow a structured, three-phase, feature-driven development process to ensure clarity, quality, and traceability. Each phase has a specific reporting template that must be followed.

1.  **Feature Definition**: A new feature is defined in a `.txt` or `.md` file and placed in `develop/Remaining/`. This file acts as the single source of truth for the feature's requirements.

2.  **Phase 1: Planning**:
    *   Before any code is written, a detailed implementation plan is generated.
    *   This plan outlines all new files to be created and existing files to be modified.
    *   It also lists all new functions and their intended purpose.
    *   This step ensures the architectural approach is sound before implementation begins.
    *   **Output**: A response following the "Planning Phase Template".

3.  **Phase 2: Implementation**:
    *   A developer implements the feature according to the plan.
    *   **Output**: An XML block with the code changes, followed by a response using the "Implementation Phase Template".

4.  **Phase 3: Testing**:
    *   A comprehensive QA test plan is generated, including unit, integration, and end-to-end test cases. This plan is stored in `develop/Testing/`.
    *   The feature is rigorously tested against the plan.
    *   **Output**: A response following the "Testing Phase Template".

5.  **Completion**:
    *   Once implemented and tested, the feature's definition file is moved from `develop/Remaining/` to `develop/Completed/`. This provides a clear, auditable history of the project's progress.

### Phase Reporting Templates

#### Planning Phase Template
```plaintext
---Start OF Planning Feature : "xx"---

[Detailed plan for implementation, including UI/UX choices, component structure, and state management strategy.]

- I have Finished Planning for the feature "xx", and am ready to start Implementing. Here are the planned files and functions:

**The New/update Planned Files**
- **New Files**:
  - `path/to/new/file1.ts`
  - `path/to/new/file2.tsx`
- **Updating Files**:
  - `path/to/existing/file1.ts`
  - `path/to/existing/file2.tsx`

**The New/update Planned Functions**
- **New Functions**:
  - `newFunctionOne()` in `file1.ts`: [Brief description]
  - `NewComponent()` in `file2.tsx`: [Brief description]
- **Updating Functions**:
  - `existingFunction()` in `file1.ts`: [Brief description of changes]

---End OF Planning Feature : "xx"---
```

#### Implementation Phase Template
```plaintext
---Start OF implementing Feature : "xx"---

[A brief conversational summary of the changes made.]

- I have Finished implementing for the feature "xx", and am ready to start Testing. Here are the files and functions that have been created and updated:

**The New/update implementing Files**
- **New Files**:
  - `path/to/new/file1.ts`
  - `path/to/new/file2.tsx`
- **Updating Files**:
  - `path/to/existing/file1.ts`
  - `path/to/existing/file2.tsx`

**The New/update implementing Functions**
- **New Functions**:
  - `newFunctionOne()`
  - `NewComponent()`
- **Updating Functions**:
  - `existingFunction()`

---End OF implementing Feature : "xx"---
```

#### Testing Phase Template
```plaintext
---Start OF Testing Feature : "xx"---

[A brief summary of the testing approach and the generated QA report.]

[The generated QA report content will be here or in a separate file.]

---End OF Testing Feature : "xx"---
```
---

## 4. Communication Protocol

To streamline our development process, we use a simple communication shorthand:

-   **Sending a single period (`.`)**: When the project lead ("hedra") sends a message containing only a period, it signifies that the previous response has been reviewed, approved, and that development should proceed to the next planned feature or task.

---

## 5. Getting Started

### Prerequisites

-   Node.js (v18.x or higher)
-   npm / yarn / pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone [repository_url]
    ```
2.  Navigate to the project directory:
    ```bash
    cd [project_name]
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 6. Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **API Client**: Axios / Fetch API
-   **State Management**: React Context / Zustand
-   **Testing**: Vitest, React Testing Library

---

## 7. Configuration

Application configuration is managed through environment variables. Create a `.env` file in the root of the project and add the required variables.

```
# .env.example
API_BASE_URL="https://api.example.com"
API_KEY="your_api_key_here"
```

---

## 8. Future Improvements

-   **CI/CD Pipeline**: Implement a CI/CD pipeline (e.g., GitHub Actions) to automate testing and deployment.
-   **Internationalization (i18n)**: Add support for multiple languages.
-   **Accessibility (a11y) Audit**: Perform a full accessibility audit to ensure the application is usable by everyone.