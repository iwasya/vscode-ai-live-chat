# Changelog

## 0.2.9 - 2026-05-30

- Add README logo and badges for a more polished GitHub project page.

## 0.2.8 - 2026-05-30

- Add GitHub Actions workflow for automatic VSIX release uploads when version tags are pushed.

## 0.2.7 - 2026-05-30

- Default VS Code sidebar location to the right for an assistant-style layout.
- Move sidebar to the right when running `You Chat: Open Chat`.

## 0.2.6 - 2026-05-30

- Add slash command autocomplete menu when typing `/` in the chat input.
- Support keyboard navigation with arrow keys, Enter, Tab, and Escape.

## 0.2.5 - 2026-05-30

- Add chat input slash commands: `/you`, `/ask`, `/fix`, `/bugs`, `/file`, `/project`, `/problems`, `/key`, and `/clear`.
- Add slash command help text and examples.

## 0.2.4 - 2026-05-30

- Move chat UI into a dedicated Activity Bar sidebar view.
- Update extension publisher metadata from `local-dev` to `R4ten99`.

## 0.2.3 - 2026-05-30

- Fix chat layout so the prompt composer stays fixed at the bottom.
- Make only the answer/chat area scrollable.
- Keep prompt textarea height stable with internal scrolling.

## 0.2.2 - 2026-05-30

- Add `Use Workspace` chat toggle to attach active file and project context to normal chat prompts.
- Update system prompt so AI uses attached local workspace context instead of claiming it cannot read the project.

## 0.2.1 - 2026-05-30

- Add VSIX extension icon from `icon.png`.
- Use optimized 128x128 icon asset for packaging.

## 0.2.0 - 2026-05-30

- Add SecretStorage API key command.
- Add answer insert and replace selection actions.
- Add VS Code Problems explanation command.
- Add persistent chat history via workspace state.

## 0.1.0 - 2026-05-30

Initial MVP release.

- Add VS Code webview chat panel.
- Add You.com Research API integration.
- Add API key and context settings.
- Add commands for selected code, active file explanation, bug checking, and project analysis.
- Add copy answer, clear chat, loading state, and error handling.
