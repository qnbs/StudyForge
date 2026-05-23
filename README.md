<div align="center">
  <img src="https://via.placeholder.com/120x120?text=SF" alt="StudyForge Logo" width="120" />
  <h1>StudyForge</h1>
  <p><em>The Next-Generation, Privacy-First Academic Intelligence Engine</em></p>
  
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Local-First](https://img.shields.io/badge/Architecture-Offline_First-10b981)](ARCHITECTURE.md)
  [![WebGPU](https://img.shields.io/badge/Hardware-WebGPU_Ready-6366f1.svg)](SETUP.md)
</div>

---

## 🌟 Introduction

Welcome to **StudyForge**, an ultra-sophisticated, 100% offline-first progressive web application (PWA) conceived to revolutionize the academic and scientific writing lifecycle. Built at the intersection of local AI computing and modern web architecture, StudyForge transforms your browser into a robust, secure, and privacy-respecting cognitive co-pilot.

By leveraging state-of-the-art WebGPU acceleration and high-performance WebAssembly (WASM), StudyForge obliterates the traditional boundaries of browser-based software, running heavy machine learning workloads—including Large Language Models (LLMs) and Vector Embeddings—directly on your local hardware.

## 🚀 Key Advancements & State-of-the-Art Capabilities

### 🛡️ Ironclad Privacy via Offline-First Execution
Your academic data, intellectual property, and research literature never leave your machine. StudyForge operates entirely within the secure sandbox of your browser.
* **Trustless Environments**: No server telemetry, no cloud synchronization of documents, and zero middle-men.
* **OPFS for Embeddings**: Origin Private File System stores embedding vectors; bibliographic metadata and Zotero cache live in IndexedDB (Dexie v6).

### 🧠 Heterogeneous Local RAG (Retrieval-Augmented Generation) Pipeline
Forget slow server round-trips. StudyForge embeds a seamless local indexing engine utilizing custom Web Workers.
* **Xenova/Transformers Integration**: Parses, chunks, and semantically embeds massive PDFs utilizing zero-latency WASM threads.
* **Hybrid Search (BM25 + RRF)**: Dense cosine similarity and sparse BM25 keyword scores are fused via Reciprocal Rank Fusion (`queryRAGHybrid`) for sharper retrieval on technical PDFs.
* **Asynchronous Chunking**: Background web-workers ensure the main UI thread remains fluid at 60 FPS, even while indexing a 500-page academic journal.

### ⚙️ Unleashed Computation: WebGPU & Model Execution
At the core of the reasoning engine lies `wllama` and the WebGPU standard, allowing raw silicon access.
* **Wllama Model Presets**: Agents and settings map to `low` / `medium` / `high` GGUF presets (Llama 3.2 1B, Phi 3.5 Mini, Llama 3.1 8B) with legacy name migration on DB upgrade.
* **Dynamic VRAM Scaling**: Built-in logic to gracefully fallback to WASM (CPU) runtimes if GPU memory is insufficient, maximizing hardware compatibility without catastrophic failure.
* **Smart Context Bridging**: Chat interfaces intelligently orchestrate prompt wrappers, system roles, and retrieved context chunks to output precise academic prose.

### 🔐 Multi-Layered Cryptographic BYOK Vault
For devices that lack the hardware muscle to run 8B-parameter models locally, StudyForge implements a rigorous "Bring Your Own Key" (BYOK) architecture.
* **AES-256 Symmetric Encryption**: API keys are locally encrypted via an interactive Master Password protocol and stored transparently within IndexedDB.
* **Auto-Lock Security Lifecycle**: Built-in inactivity monitors seamlessly purge the decrypted session keys from memory, ensuring physical device security.

### 🎨 Modular Academic Workflow Shell (PWA)
StudyForge is not just an application; it is an academic operating system carefully crafted around proven workflows.
* **Progressive Web App (PWA)**: Fully installable capabilities complete with service-worker driven offline caching for crucial fonts, scripts, and navigation routing, ensuring operation without any internet connection.
* **Elaboration & Writing Phases**: Distinct structural phases guiding you from literature review and ideation, straight to structured prose drafting.
* **Dynamic Agent Workshop**: Sculpt, refine, and deploy customized system-prompted agents directly tailored to specific academic tasks. Includes real-time search filtering and hover-triggered prompt snippet popovers for the community template gallery.
* **Exports**: Robustly export your active works to standard `.md`, `.html`, `.txt`, and structural LaTeX boilerplate `.tex` natively.
* **Secure Zotero Hub (v2)**: Incremental bibliographic sync via the official Zotero Web API (`zotero-api-client`) — collections, paginated items, deletion tracking. Credentials (User ID + API key) live in the encrypted vault; sync is **user-initiated only** (no background pull on startup). Optional PDF attachment ingest into the local RAG pipeline.
* **Internationalization (i18n)**: Out-of-the-box support for multiple languages (English and German) with scalable dictionary structures.
* **High-Fidelity Animations**: Integrating `motion/react` for buttery-smooth layout transitions and staggered phase loaders without blocking the main engine thread.

---

## 🛠️ Getting Started & Technical Documentation

Embark on your enhanced research journey with zero configuration friction.

* **[SETUP.md](./SETUP.md)**: Explore precise hardware requirements, memory optimization strategies, and initial bootstrapping workflows.
* **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Drill down into the highly decoupled, message-passing Web Worker design, state persistence, and cryptographic methodologies.
* **[docs/CODEGRAPH.md](./docs/CODEGRAPH.md)** & **[docs/GRAPHIFY.md](./docs/GRAPHIFY.md)**: Cursor/agent code navigation — CodeGraph (symbols, call graphs) + Graphify (architecture snapshot). See [CONTRIBUTING.md](./CONTRIBUTING.md) for clone setup.

---

## 🧬 The Ecosystem of the Future

StudyForge serves as a living testament to what the modern web is capable of. By bridging complex neural networks directly into the user's browser, we remove the friction of cloud computing, slash latency to literal zero, and grant users absolute sovereignty over their cognitive extensions.

> *Crafted for researchers, scholars, and builders who demand uncompromising performance and privacy.*
