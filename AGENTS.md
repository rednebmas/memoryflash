# Guidelines for MemoryFlash Contributors

This project prefers a highly componentized React codebase that avoids duplicate code.

- **Componentization**: Extract reusable JSX into components whenever possible. Keep components small and focused refactoring them as needed.
- **Code Size**: Keep individual functions under 25 lines. Keep files under 150 lines when possible. If code grows larger, refactor into smaller components to keep it readable, maintainable, and elegant.
- **Refactoring**: You are empowered to rewrite or refactor existing code to avoid duplication and to simplify the code base. It's prefered to delete lines of code than to add lines of code to solve problems.
- **Styling**: Use Tailwind CSS utility classes. Share common styling through base components rather than repeating class strings.
- **Git**: Do not commit .png files
- **Formatting**: Code is formatted with Prettier using tabs. Run `npx prettier --write` before committing. Don't add comments to code unless absolutely necessary.
- **Testing**: After changes, run `yarn test:codex` from the repository root to ensure all tests pass.
- **Type Safety**: Avoid casting to `any`.
- **Redux**: Compose selectors and helpers rather than copy/pasting logic.

Follow these guidelines to keep the codebase clean and maintainable.

## End-to-End Testing with Playwright MCP

This project has two Playwright MCP servers configured for browser automation:

- **`playwright`** - Pre-authenticated session with test data seeded. Use this for testing features that require login.
- **`playwright-guest`** - No authentication. Use this for testing login, signup, and other unauthenticated flows.

### When to Use Browser Testing

- After making UI changes, verify they render correctly in the browser
- When implementing new features, test the full user flow end-to-end
- Don't mark a feature complete without verifying it works as a user would experience it
- Use browser testing to catch bugs that aren't obvious from code alone

### How to Test

1. **Start the dev server**: Run `yarn dev` to start the app at http://localhost:5173
2. **Use Playwright MCP tools**: Navigate to pages, take screenshots, interact with elements, and verify behavior
3. **Test as a user would**: Click buttons, fill forms, and verify the expected outcomes appear

### Testing Workflow

- Make incremental changes and verify each step works before moving on
- If something breaks, revert and fix before continuing
- Take screenshots to verify visual correctness when relevant
- Run `yarn test:codex` after changes to ensure existing tests still pass

### Troubleshooting

If auth state is missing or expired: `yarn workspace MemoryFlashReact generate-auth-state`
