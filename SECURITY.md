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
Since StudyForge doesn't operate a centralized backend, traditional vectors (SQLi, Server SSRF, etc.) do not apply. However, we actively consider the following to be critical vulnerabilities within our architecture context:
1. **Malicious PDF Ingestion Exfiltration:** Vectors that allow an uploaded PDF to execute hidden JS manipulating the RAG engine to exfiltrate IndexedDB data back out through malicious URL construction. We harden `pdfjs-dist` to purely extract text via its mapping API and do not execute embedded scripts.
2. **Cross-Site Scripting (XSS):** If an exported Markdown or LaTeX file sanitization fails and allows sandbox escape.
3. **Third-Party Integrations:** Malicious responses from external API connections like Zotero or Mendeley that could inject executable code or maliciously mutate local state.
4. **Vault Decryption & Key Exposure:** Flaws in how the Master Password derives the PBKDF2 key, or improper AES-GCM IV/Salt management that would weaken the encryption of BYOK API Keys stored locally.

### Cryptographic Vault Architecture
StudyForge implements a zero-trust Local Vault for Bring-Your-Own-Key (BYOK) secrets.
- **Algorithm**: AES-256-GCM.
- **Key Derivation**: PBKDF2 with HMAC-SHA256. We default to OWASP recommended bounds (600,000 iterations).
- **Storage**: Keys encode their initialization vectors (`iv`) and `salt` internally in IndexedDB (`Dexie`).
- **Memory Lifetime**: Derived keys and raw API secrets exist only transiently in memory. They are wiped upon app hard refresh or timeout.

## Default Principles
- **CSP (Content Security Policy):** The app uses a pragmatic CSP in `index.html` (`unsafe-inline`/`unsafe-eval` for Vite dev/build, `connect-src https:` for Zotero/PubMed/CDN models). Tightening CSP further requires a nonce-based build pipeline.
- **Storage Encryption:** While local `OPFS` storage is walled off per origin by the browser, sensitive API keys for external services (Zotero) are hashed or wiped if the local-only strict mode is enforced.
