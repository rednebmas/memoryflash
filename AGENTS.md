# Guidelines for MemoryFlash Contributors

This project prefers a highly componentized React codebase that avoids duplicate code.

- **DRY Code (CRITICAL)**: Before writing ANY new code, ALWAYS search the codebase for existing implementations that might already solve your problem. Never duplicate logic - if similar code exists, refactor to share it. If you find yourself writing similar patterns, extract it into a helper function or component. Violating DRY is unacceptable.
- **Componentization**: Extract reusable JSX into components whenever possible. Keep components small and focused refactoring them as needed.
- **Encapsulation**: Components should own their own logic. If a component needs to compute something from props (like whether to show itself, or how to render data), that logic belongs inside the component—not in the parent. Parents should pass raw data (like an entire `card` object), not pre-computed derived values. This keeps parent components simple and makes child components self-contained and reusable.
- **Code Size**: Keep individual functions under 25 lines. Keep files under 150 lines when possible. If code grows larger, refactor into smaller components to keep it readable, maintainable, and elegant.
- **Refactoring**: You are empowered to rewrite or refactor existing code to avoid duplication and to simplify the code base. It's prefered to delete lines of code than to add lines of code to solve problems.
- **Styling**: Use Tailwind CSS utility classes. Share common styling through base components rather than repeating class strings.
- **Git**: Do not commit .png files
- **Formatting**: Code is formatted with Prettier using tabs. Run `npx prettier --write` before committing. Don't add comments to code unless absolutely necessary.
- **Testing**: After changes, run `yarn test:codex` from the repository root to ensure all tests pass.
- **Type Safety**: You are not allowed to use `any` or `unknown`.
- **Redux**: Compose selectors and helpers rather than copy/pasting logic.
- **Error Handling**: Keep error handling reasonable but not excessive. This is a small app - simple null checks and basic 404s are fine. Don't over-engineer with detailed error types for every edge case.
- **Unit Tests**: Write unit tests for important service functions, especially those involving business logic or data transformations.

Follow these guidelines to keep the codebase clean and maintainable.
