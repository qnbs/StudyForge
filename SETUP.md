# Setup & Initialization Guide

StudyForge leverages cutting-edge web APIs such as WebGPU, OPFS, and WASM to run heavy machine learning workloads directly in your browser. It includes automatic hardware detection and a graceful degradation pathway to standard CPU WASM if a capable GPU is unavailable.

## Developer Setup

```bash
git clone https://github.com/qnbs/StudyForge.git
cd StudyForge
npm install
npm run dev      # http://localhost:3000
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (HMR enabled) |
| `npm run build` | Production build + PWA service worker |
| `npm run preview` | Preview production build |
| `npm test` | Vitest unit tests |
| `npm run lint` | ESLint + TypeScript check |

No `.env` file is required for core features. Optional cloud BYOK keys are stored in the in-app vault, not in environment variables.

![StudyForge UI Preview](https://via.placeholder.com/800x450?text=StudyForge+Hero+Screenshot)

## Minimum Requirements

- **Browser**: Google Chrome 113+ or Microsoft Edge 113+ (Safari and Firefox have experimental/limited WebGPU support).
- **Hardware**: A dedicated GPU or modern Apple Silicon (M1+). At least 8GB of system RAM, ideally 16GB+ for 3B+ parameter models.
- **Disk Space**: At least 5–10 GB of free space for caching models into the unified browser storage (OPFS).

---

## 🚀 Quick-Start Workflow
1. **Upload a Document**: Go to the **Library** phase, and drop your local PDF.
2. **Review Vectors**: Observe the status switch from _Processing_ to _Vectorized_.
3. **Draft Context**: Switch to **Elaboration** or **Writing** phase.
4. **Chat**: Use the right-hand panel assistant to chat with your document using local RAG.

### Zotero Hub (optional)

1. In Zotero: **Settings → Feeds/API** → create an API key (read access is sufficient for sync).
2. In StudyForge: **Settings** → set and unlock the **Master Password** (vault).
3. **Library** → **Zotero Sync** → enter User ID + API key → **Connect & Sync**.
4. Browse collections in the Zotero Hub panel; use **Import** per item to add metadata to the local library.
5. Optionally enable **Download PDFs during sync** to vectorize attachments via the same RAG pipeline as local uploads.

Sync is never automatic on app load — use **Sync now** or `Ctrl/Cmd + K` → “Sync Zotero”. Large libraries are paginated (100 items per request) with rate-limit protection (~300 requests / 5 min per Zotero API key).

<!-- *(Insert Quick-Start Workflow Video/GIF here)* -->
![Quick Start Workflow](https://via.placeholder.com/800x450?text=Quick+Start+GIF+Placeholder)

---

## Enabling WebGPU

If you are using an older version of Chrome or a browser where WebGPU is disabled by default:
1. Open your browser and navigate to `chrome://flags` (or `edge://flags`).
2. Search for "WebGPU".
3. Set the `Unsafe WebGPU` or `WebGPU` flag to **Enabled**.
4. Restart your browser.

## Hybrid RAG Retrieval

After vectorization, queries use **hybrid search**:

1. **BM25** ranks chunks by keyword overlap with your question.
2. **Dense vectors** rank by cosine similarity in OPFS.
3. **RRF (k=60)** merges both lists without tuning score scales.

Implementation: `src/lib/rag/hybridSearch.ts`, invoked from `ragService.queryRAG()`.

---

## Selecting the Right LLM Quantization

StudyForge defaults to using `Wllama` to execute HuggingFace GGUF models directly on WebGPU.
When you enter the **Settings** menu inside the app, you can choose from different model preset queues (`low` / `medium` / `high`):

| Preset | Model Type | Size | Ideal for |
|--------|------------|------|-----------|
| Low-End | Llama 3.2 1B (Q4_K_M) | ~1 GB | Fast Q&A, basic rewriting, low memory devices |
| Medium | Phi 3.5 Mini (Q4_K_M) | ~2.5 GB | RAG, summarization, Sweet Spot balance |
| High-End | Llama 3.1 8B (Q4_K_M) | ~5 GB | Complex tasks, precise academic alignment |

You may also supply a **Custom GGUF URL** point directly to a HuggingFace `.gguf` file allowing you to test specific fine-tunes locally!

---

## Real-World Troubleshooting & Fallbacks

### 💣 Out of Memory (OOM) Errors (SAD Tab)
The main drawback of WebGPU is its rigid memory allocation behavior. If you allocate a 5GB 8B-LLM but your OS/Browser only permits 4GB contiguous buffer, the Tab will aggressively crash ("Aw, Snap!"). 

**Fixes:**
1. Switch to a smaller model in generic `Settings`. 
2. Close other GPU-intensive tabs (Figma, YouTube, WebGL tests).

### 🖥️ Chrome vs Edge vs Firefox
- **Edge on Windows**: Often manages WebGPU hardware acceleration better on low-spec Windows machines due to DX12 integration bounds. 
- **Chrome on Mac**: The undisputed king for WebGPU. Apple's Metal backend connects flawlessly to `wgpu`, giving massive inference speedups on M1/M2/M3 arrays.
- **Firefox/Safari**: Currently strictly experimental. We recommend Chromium. You will fallback to `WASM (CPU)` on Firefox which implies a 5x slowdown.

### 📄 Handling Giant PDFs
When uploading heavy documents (400+ pages), the parse chunking and MiniLM-L6 embedding pipeline routes tokens safely.
- **The Process:** The app routes PDF parsing bounding boxes mapping to `pdfWorker.ts`, and embeddings to `embeddingWorker.ts`. We process chunks concurrently in intelligent, rate-limited batches (`concurrency=5`) to explicitly prevent workers queueing up to OOM errors.
- **Limits:** Extremely large PDFs operate significantly better now due to the controlled asynchronous event pooling.

## First Time Load Experience

The very first time you initialize the LLM or run a RAG pipeline (PDF vectorization):
- It must download the LLM weighting files. This can take several minutes based on internet speeds.
- It will cache them into Origin Private File System (OPFS).
- Subsequent loads will be **nearly instant**.
