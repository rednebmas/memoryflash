# Guidelines for MemoryFlash Contributors

This project prefers a highly componentized React codebase. When creating UI elements:

-   **Componentization**: Extract reusable JSX into components whenever possible. Keep components small and focused.
-   **File Organization**: Group related components together in folders (e.g., all input components live in `components/inputs`).
-   **Styling**: Use Tailwind CSS utility classes. Share common styling through base components rather than repeating class strings.
-   **Formatting**: Code is formatted with Prettier using tabs. Run `npx prettier --write` before committing if available.
-   **Testing**: After changes, run `yarn test` from the repository root.

Follow these guidelines to keep the codebase clean and maintainable.
