# Monica Project: AI Developer Architectural Overview

**ROLE:** You are an AI developer tasked with building features for the Monica project. Understanding this architecture is critical for successful contributions.

---

## Core Concept: Separation of Concerns

The Monica application is built on a clean, three-layer architecture to ensure logic is decoupled and maintainable.

1.  **UI Layer (`/components`)**: The presentation layer. It is responsible for what the user sees.
2.  **State & Orchestration Layer (`/contexts`)**: The control layer. It manages all application data and business logic.
3.  **Service Layer (`/services`)**: The data layer. It handles all communication with external APIs (specifically, the Google Gemini API).

## The Data Flow: A Unidirectional Path

Data and user actions flow in a strict, predictable, one-way loop.

**Example: Sending a Message**

1.  **Action (UI Layer):** A user interacts with a component, for example, by clicking the "Send" button in `MessageInput.tsx`.

2.  **Dispatch (UI -> State Layer):** The component does **not** contain the logic itself. Instead, it calls a function it received from the global context, like `handleSendMessage()`.

3.  **Orchestration (State Layer):**
    -   The `handleSendMessage` function resides in the `useChatHandler` hook (`/contexts/hooks/useChatHandler.ts`).
    -   This hook first updates the state immediately to show the user's message in the UI. This provides instant feedback.
    -   It then determines which business logic to run based on the current `conversationMode` (e.g., 'Dynamic', 'AI', 'Manual').
    -   Crucially, the hook then calls a function in the **Service Layer** to perform the AI task.

4.  **Execution (Service Layer):**
    -   A function in `/services/chat/agentService.ts` or `/services/chat/managerService.ts` is executed.
    -   It receives all necessary data as arguments (e.g., the current messages, the agent's profile, the API key).
    -   It constructs the final prompt for the Gemini API.
    -   It calls the Gemini API and awaits the response.
    -   It processes the raw response (e.g., parsing JSON) and handles any errors.
    -   It returns the clean, processed data back to the State Layer.

5.  **State Update (State Layer -> UI):**
    -   The `useChatHandler` hook receives the data from the service.
    -   It updates the application's central state with the new AI message.
    -   Because React state has changed, React automatically re-renders all affected components in the **UI Layer**. The `MessageList` component now shows the new AI message.

## Key Takeaways for AI Development

-   **Never mix concerns:** Do not put API calls inside a React component. Do not put component rendering logic inside a service.
-   **The State Provider is the "Brain":** `StateProvider.tsx` and its associated hooks in `/contexts/hooks/` are where all decisions are made. When adding a new feature, your primary work will be in these files.
-   **Services are "Tools":** The files in `/services` are like a toolbox. They are stateless, reusable functions that the "Brain" can call upon to get things done.
-   **Components are "Hands and Eyes":** The files in `/components` are only for presentation and capturing user input. They are controlled entirely by the state.