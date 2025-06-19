# Guidelines for MemoryFlash Contributors

This project prefers a highly componentized React codebase that avoids duplicate code.

-   **Componentization**: Extract reusable JSX into components whenever possible. Keep components small and focused refactoring them as needed.
-   **File Organization**: Group related components together in folders
-   **Styling**: Use Tailwind CSS utility classes. Share common styling through base components rather than repeating class strings.
-   **Formatting**: Code is formatted with Prettier using tabs. Run `npx prettier --write` before committing. Don't add comments to code unless absolutely necessary.
-   **Testing**: After changes, run `yarn test:codex` from the repository root to ensure all tests pass.

Follow these guidelines to keep the codebase clean and maintainable.
