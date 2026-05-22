# Setup & Initialization Guide

StudyForge leverages cutting-edge web APIs such as WebGPU, OPFS, and WASM to run heavy machine learning workloads directly in your browser.

## Minimum Requirements

- **Browser**: Google Chrome 113+ or Microsoft Edge 113+ (Safari and Firefox have experimental/limited WebGPU support).
- **Hardware**: A dedicated GPU or modern Apple Silicon (M1+). At least 8GB of system RAM, ideally 16GB+ for 3B+ parameter models.
- **Disk Space**: At least 5–10 GB of free space for caching models into the unified browser storage quota.

## Enabling WebGPU

If you are using an older version of Chrome or a browser where WebGPU is disabled by default:
1. Open your browser and navigate to `chrome://flags` (or `edge://flags`).
2. Search for "WebGPU".
3. Set the `Unsafe WebGPU` or `WebGPU` flag to **Enabled**.
4. Restart your browser.

## Selecting the Right LLM Quantization

StudyForge defaults to using `Wllama` to execute HuggingFace GGUF models directly on WebGPU.
When you enter the **Settings** menu inside the app, you can choose from different model preset queues:

| Preset | Model Type | Size | Ideal for |
|--------|------------|------|-----------|
| Low-End | Llama 3.2 1B (Q4_K_M) | ~1 GB | Fast Q&A, basic rewriting, low memory devices |
| Medium | Phi 3.5 Mini (Q4_K_M) | ~2.5 GB | RAG, summarization, Sweet Spot balance |
| High-End | Llama 3.1 8B (Q4_K_M) | ~5 GB | Complex tasks, precise academic alignment |

You may also supply a **Custom GGUF URL** point directly to a HuggingFace `.gguf` file allowing you to test specific fine-tunes locally!

## First Time Load Experience

The very first time you initialize the LLM or run a RAG pipeline (PDF vectorization):
- It must download the LLM weighting files. This can take several minutes based on internet speeds.
- It will cache them into Origin Private File System (OPFS).
- Subsequent loads will be **nearly instant**.

If your browser runs out of memory (Out of Memory - OOM), StudyForge will gracefully catch this, warn you, and attempt shifting to the lowest requirement tier.
