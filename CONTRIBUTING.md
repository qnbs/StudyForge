# Contributing Guidelines

First off, thank you for considering contributing to StudyForge! It is people like you that make StudyForge such a great tool for academic research.

## Code of Conduct
This project and everyone participating in it is governed by the [StudyForge Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs
This section guides you through submitting a bug report for StudyForge.
* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps** which reproduce the problem in as many details as possible.
* **Provide specific examples** to demonstrate the steps.
* **Describe the behavior you observed** after following the steps and point out what exactly is the problem with that behavior.

### Suggesting Enhancements
* **Ensure the enhancement** doesn't conflict with the offline-first/privacy-first core philosophies.
* **Provide a step-by-step description** of the suggested enhancement in as many details as possible.
* **Provide specific examples** to demonstrate the steps.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Styleguides

### Git Commit Messages
* Use the present tense ("Add feature" not "Added feature").
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
* Limit the first line to 72 characters or less.
* Reference issues and pull requests liberally after the first line.

### TypeScript / React
* Prefer functional components over classes.
* Avoid redundant state. Prioritize derived state variables.
* Stick to Tailwind utility classes instead of defining custom CSS classes.
* Utilize `lucide-react` for iconography.

## Cursor Rules & MCP

* Agent rules live in `.cursor/rules/*.mdc` (modular). Do not add `.cursorrules`.
* Global manifest: `.cursor/index.mdc` (always applied, keep under 100 lines).
* MCP (low-end): `cp .mcp.example.json .cursor/mcp.json` — graphify only via `scripts/graphify-mcp-serve.sh`
* Graphify solo-dev: see `docs/GRAPHIFY.md` — run `npm run graphify:refresh` before push; commit only `graph.json` + `GRAPH_REPORT.md`
* Do **not** use `graphify watch`, `graphify hook install`, or commit `graphify-out/cache|memory|wiki`

### RAG & local LLM conventions

* Agent `model` values: preset keys `low` | `medium` | `high` or a full GGUF HTTPS URL — resolved in `src/lib/modelConfig.ts`.
* Chat and agent tests call `ensureModelForRef()` from `LLMContext` before generation.
* RAG queries use hybrid BM25 + vector fusion (`queryRAGHybrid`); extend `src/lib/rag/hybridSearch.test.ts` for retrieval changes.
* No `@google/genai` or `dotenv` in dependencies — cloud keys stay in the encrypted BYOK vault only.
* Product requirements: `docs/PRD.md` — read before architectural changes.
