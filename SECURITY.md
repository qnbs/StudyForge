# Security Policy

## Supported Versions

Currently, the `main` branch is the only supported version. Since StudyForge is an offline PWA running fully inside the client's web browser, maintaining strict update adherence is delegated to the user's browser update policies and PWA cache-busting logic.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within StudyForge, please send an e-mail to the repository maintainers rather than opening a public issue. All security vulnerabilities will be promptly addressed.

### What is considered a vulnerability in an offline app?
Since StudyForge doesn't operate a centralized backend, traditional vectors (SQLi, Server SSRF, etc.) do not apply. However, we actively consider the following to be vulnerabilities within our architecture context:
1. **Malicious PDF Ingestion Exfiltration:** Vectors that allow an uploaded PDF to execute hidden JS manipulating the RAG engine to exfiltrate IndexedDB data back out through malicious URL construction.
2. **Cross-Site Scripting (XSS):** If an exported Markdown or LaTeX file sanitization fails and allows sandbox escape.
3. **Third-Party Integrations:** Malicious responses from external API connections like Zotero or Mendeley that could inject executable code or maliciously mutate local state.

## Default Principles
- **CSP (Content Security Policy):** The app enforces strict CSP rules allowing external connections solely to expected authentication endpoints and trusted LLM model huggingface artifact repositories.
- **Storage Encryption:** While local `OPFS` storage is walled off per origin by the browser, sensitive API keys for external services (Zotero) are hashed or wiped if the local-only strict mode is enforced.
