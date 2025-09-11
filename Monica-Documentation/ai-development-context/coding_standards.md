# Monica Project: AI Developer Coding Standards

**ROLE:** You are an expert senior frontend engineer contributing to the Monica project. Adherence to these standards is mandatory for all code you generate.

---

## 1. General Principles

-   **Single Responsibility Principle (SRP):** Every file, component, and function must have a single, well-defined purpose.
-   **Clarity and Readability:** Code must be easy for human developers to understand. Use descriptive variable names and add comments for complex logic.
-   **Type Safety:** The project is 100% TypeScript. Avoid using `any` unless absolutely necessary and provide a justification. All function parameters and return types must be explicitly typed.

## 2. File Structure & Imports

-   **File Organization:** Adhere strictly to the existing directory structure. UI components go in `/components`, state logic in `/contexts/hooks`, API interactions in `/services`, etc.
-   **Barrel Exports:** Use `index.ts` files (barrel files) for exporting types and components from a directory to simplify import statements (e.g., `import { TypeA, TypeB } from '../types';`).
-   **Absolute vs. Relative Imports:** Use relative imports for files within the same feature domain (e.g., `./Icons.tsx`).

## 3. React & Components

-   **Functional Components:** All components must be functional components using React Hooks. Class components are prohibited.
-   **Props Typing:** All component props must be defined with a TypeScript `interface` or `type` alias.
-   **State Management:**
    -   For local, component-specific state, use `useState`.
    -   For global state that needs to be shared across the application, it **must** be added to the `AppContext` via `StateProvider.tsx`. Do not introduce new, separate contexts without a strong architectural reason.
-   **Accessibility (a11y):** All interactive elements (`button`, `a`, `input`) must have appropriate ARIA attributes (`aria-label`, `role`, etc.) and be keyboard-navigable.

## 4. Services & API Interaction

-   **Stateless Functions:** All functions in the `/services` directory must be stateless. They should not hold any internal state and must receive all required data (like API keys and conversation history) as parameters.
-   **Gemini API Client:** Always use the `getGenAIClient(apiKey)` factory from `services/gemini/client.ts` to get a Gemini instance. Never create a new `GoogleGenAI` instance directly within a service function.
-   **Error Handling:**
    -   All API calls must be wrapped in a `try...catch` block.
    -   On failure, you must call `handleAndThrowError(error, 'context-string', prompt)` from `services/utils/errorHandler.ts`. This ensures consistent error logging and user-friendly messages.
-   **Prompt Engineering:** Prompts sent to the Gemini API must be clear, detailed, and provide examples where possible. When requesting JSON output, you **must** use the `responseMimeType: "application/json"` and provide a `responseSchema`.

## 5. Styling

-   **Tailwind CSS First:** Use Tailwind utility classes for all styling. Only resort to custom CSS for complex animations or properties not covered by Tailwind.
-   **Consistency:** Adhere to the existing design language. Use the CSS variables defined in `index.html` for colors (`--color-bg`, `--color-pane`, etc.) and fonts. Use existing components and styles before creating new ones.
-   **Responsiveness:** All new UI must be fully responsive and tested on both mobile and desktop screen sizes.