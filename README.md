# 📚 StudyForge

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Standard](https://img.shields.io/badge/Standard-Semantic%20Versioning-informational.svg)](CHANGELOG.md)

[English](#english) | [Deutsch](#deutsch)

---

<br />

<h2 id="english">🇺🇸 English</h2>

**StudyForge** is a fully local, offline-first, privacy-respecting Progressive Web Application (PWA) designed to serve as an AI-assisted co-pilot for academic writing and research. It runs Large Language Models (LLMs) and advanced Retrieval-Augmented Generation (RAG) directly in your browser. 

### 🌟 Key Features

*   🔒 **Zero-Trust Privacy:** Models run entirely in your browser using **WebGPU** and **WebLLM**. No data (text or PDFs) ever leaves your machine. Your research is yours.
*   🧠 **Local RAG & Semantic Search:** Securely vectorize and embed your uploaded PDFs locally. Retrieve relevant academic context without cloud APIs.
*   🤖 **Agent Workshop:** Create, configure, and customize AI personas (Reviewers, Critics, Summarizers, Translators) tailored to your exact workflow.
*   📚 **Reference Sync:** Native integrations for **Zotero** and **Mendeley** via OAuth/API. Import metadata seamlessly into your local IndexedDB for offline access.
*   📱 **Cross-Platform PWA:** Works natively on Desktop, Tablet, and Mobile with a fully responsive, modern layout (including bottom navigation for mobile).
*   🌍 **Bilingual Support:** Full interface localization in English and German.
*   📄 **Extensive Exports:** Direct export support for **LaTeX**, PDF, and structured Markdown files (DOCX coming soon).

### 📖 Documentation

Detailed documentation on the repository and its architecture can be found in the associated files:
*   [Architecture Overview](ARCHITECTURE.md)
*   [Changelog](CHANGELOG.md)
*   [Contributing Guidelines](CONTRIBUTING.md)
*   [Security Policy](SECURITY.md)
*   [Code of Conduct](CODE_OF_CONDUCT.md)
*   [Architectural Decision Records (ADRs)](docs/ADR/)

### 🚀 Getting Started

Simply run the development server or open the built application. Setup requires modern browsers (Chrome/Edge/Safari) with WebGPU enabled to leverage the local AI capabilities fully.

### 🌐 Play in AI Studio / Live Preview

You can directly run, preview, and test **StudyForge** online via Google AI Studio at the following link:

👉 [**StudyForge AI Studio App**](https://ai.studio/apps/9f9af1d6-4f48-45ec-ba6e-9291a5e2dc3d)

*This interactive workspace allows you to try out the StudyForge web app and its LLM capabilities in a sandboxed, interactive environment without needing any local setup.*

---

<br />

<h2 id="deutsch">🇩🇪 Deutsch</h2>

**StudyForge** ist eine zu 100 % lokale, offline-fähige Progressive Web App (PWA) mit kompromisslosem "Privacy-First"-Fokus. Sie dient als KI-gestützter Co-Pilot für wissenschaftliches Schreiben und Recherchieren, der Sprachmodelle (LLMs) direkt in deinem Browser ausführt.

### 🌟 Hauptfunktionen

*   🔒 **Zero-Trust Datenschutz:** Modelle laufen komplett im Browser via **WebGPU** und **WebLLM**. Keine Dokumente, Prompts oder Daten verlassen dein Endgerät.
*   🧠 **Lokales RAG & Semantische Suche:** Vektorisiert deine PDFs lokal (via OPFS) und nutzt eine semantische Suchmaschine (RAG) absolut ohne Cloud-Anbindung.
*   🤖 **Agenten-Werkstatt:** Erstelle benutzerdefinierte KI-Personas (Lektoren, Kritiker, Übersetzer), die deine Arbeitsweise exakt ergänzen.
*   📚 **Zotero- & Mendeley-Sync:** Importiere Literatur und Metadaten nahtlos via API/OAuth in deine lokale IndexedDB für den unkomplizierten Offline-Einstieg.
*   📱 **Plattformübergreifende PWA:** Installierbare Web-App für Desktop, Tablet und Smartphone mit voll-responsivem Design (inkl. "Bottom-Nav" auf Mobilgeräten).
*   🌍 **Zweisprachig:** Komplette Benutzeroberfläche wahlweise auf Englisch oder Deutsch.
*   📄 **Umfangreiche Exporte:** Direkter, nativer Export zu Projektstrukturen als **LaTeX**, PDF und Markdown (DOCX in Entwicklung).

### 📖 Dokumentation

Detaillierte Informationen und Dokumentationen zur Architektur finden sich in den entsprechenden Projektdateien (s. Übersicht im englischen Teil).

### 🌐 Live Ausprobieren in AI Studio

Du kannst **StudyForge** direkt und ohne lokale Installation über Google AI Studio testen:

👉 [**StudyForge AI Studio App**](https://ai.studio/apps/9f9af1d6-4f48-45ec-ba6e-9291a5e2dc3d)

*Dieser interaktive Workspace ermöglicht es dir, die StudyForge Web-App und ihre Funktionen als Live-Vorschau in einer sicheren, cloudbasierten Sandbox-Umgebung auszuprobieren – ganz ohne eigenes Setup.*
