# Guidelines for MemoryFlash Contributors

This project prefers a highly componentized React codebase that avoids duplicate code.

- **Componentization**: Extract reusable JSX into components whenever possible. Keep components small and focused refactoring them as needed.
- **File Organization**: Group related components together in folders
- **Styling**: Use Tailwind CSS utility classes. Share common styling through base components rather than repeating class strings.
- **Code Size**: Keep individual functions under 25 lines. Keep files under 150 lines when possible. If code grows larger, refactor into smaller components to keep it readable, maintainable, and elegant.
- **Refactoring**: Rewrite or refactor existing code to avoid duplication. Compose selectors and helpers rather than copy/pasting logic.
- **Commits**: Do not commit .png files
- **Formatting**: Code is formatted with Prettier using tabs. Run `npx prettier --write` before committing. Don't add comments to code unless absolutely necessary.
- **Testing**: After changes, run `yarn test:codex` from the repository root to ensure all tests pass.
- **Type Safety**: Avoid casting to `any`.

Follow these guidelines to keep the codebase clean and maintainable.

## LLM Screenshot Workflow

When you want Codex to capture UI screenshots, instruct it to create a file named `ui-plan.md` at the repository root. Codex should consider the UI changes it introduced and write a Markdown plan describing how to navigate to the updated screens. The plan must include a fenced `json` block listing the steps for Playwright to execute.

Example plan format:

```json
[
	{ "action": "goto", "url": "/" },
	{ "action": "screenshot", "name": "home.png" },
	{ "action": "click", "selector": "text=Login" },
	{ "action": "screenshot", "name": "login.png" }
]
```

When `ui-plan.md` exists, the workflow `.github/workflows/ui-screenshots.yml` will build the app, run `ts-node` on `.github/scripts/captureScreenshots.ts`, and upload the resulting screenshots to the pull request.
