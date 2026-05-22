# Welcome to StudyForge

StudyForge is a 100% local, offline-first, privacy-first progressive web application (PWA) that serves as an AI co-pilot for academic writing and research. The core uses Local LLMs via WebGPU (wllama) and a fully local RAG pipeline with OPFS-backed vector embeddings in your browser.

## Features
- **Local-First & Offline**: Everything runs locally in your browser. Vector embeddings are stored in IndexedDB/OPFS. Models are cached intelligently.
- **RAG Pipeline**: Upload PDFs to your workspace. StudyForge will parse, chunk, and embed them locally using `Xenova/transformers`.
- **Intelligent RAG Context**: The chat connects standard interactions to the local vector DB to provide context-aware LLM generation without cloud dependencies.
- **Bring Your Own Key (BYOK)**: A fallback encrypted vault runs client-side to optionally connect cloud endpoints like Gemini or OpenAI if your device lacks memory for local LLMs.
- **Academic PWA Shell**: Well thought-out interface supporting academic workflows from planning to elaboration to the final writing phase.

## Getting Started
Please view the [SETUP.md](./SETUP.md) for detailed instructions on minimum requirements and WebGPU initialization.

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for details on the web worker strategies and indexing layers.
