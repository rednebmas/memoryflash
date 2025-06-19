# Guidelines for MemoryFlash Contributors

This project prefers a highly componentized React codebase. When creating UI elements:

- **Componentization**: Extract reusable JSX into components whenever possible. Keep components small and focused.
- **File Organization**: Group related components together in folders (e.g., all input components live in `components/inputs`).
- **Styling**: Use Tailwind CSS utility classes. Share common styling through base components rather than repeating class strings.
  When `ui-plan.md` exists, the workflow `.github/workflows/ui-screenshots.yml` will build the app, run `ts-node` on `.github/scripts/captureScreenshots.ts`, and upload the resulting screenshots to the pull request using `scripts/upload-plan-screenshots.sh`.
- **Testing**: After changes, run `yarn test` from the repository root.
- **Type Checking**: Run `yarn workspace MemoryFlashReact build` to ensure there are no missing imports or type errors.
- **Screenshots**: When adding new Playwright `.spec.ts` files, delete any generated `.png` snapshots before committing. Maintainers will upload them separately.

Follow these guidelines to keep the codebase clean and maintainable.

For the iOS project, do not add comments to Swift source files. Keep the code
self-explanatory.

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

The screenshot runner looks for a standard login fixture at `test-fixtures/session-cookies.json`. Include a `{"action": "login"}` step in your plan and the runner will inject these cookies automatically. If any selector in the plan fails, the runner queries the `o4mini-high` model with the current page HTML to guess an updated selector.
