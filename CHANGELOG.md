# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Comprehensive architecture and standard documentation (ADR, Security, Contributing, Code of Conduct).
- Global Command Palette (`Cmd/Ctrl + K`) for quick navigation across the application.
- Mobile bottom navigation and general responsiveness improvements across all workspace phases (`LibraryPhase`, `WritingPhase`, `AgentWorkshopPhase`, `SettingsPhase`, `HelpPhase`).
- Responsive Toolbar and editor sections inside `WritingPhase`.
- English to German user interface translations mapped globally via `LanguageContext`.
- Library phase: Local Vector Store views, Zotero integrations UI, Internet Archive fetching with UI layouts.

### Changed
- Refactored general routing logic avoiding conventional complex react-router structures to stick to single-page memory swapping for PWA stability.
- Enhanced UX for settings configuration, introducing responsive tabbed sidebar navigation instead of static lists.

### Fixed
- Layout overflow issues in mobile views regarding long flex lists.
- Overlapping Z-index problems with the Sidebar and Command Palette overlays.

## [1.0.0] - 2026-05-22
### Added
- Initial project scaffolding.
- Basic React infrastructure with Vite, Tailwind CSS, Lucide Icons.
- Core local UI framework modeling the writing and research features.
