# Architectural Decision Record 0001: Use WebGPU for Local LLM Execution

**Date:** 2026-05-22
**Status:** Accepted

## Context
StudyForge aims to provide AI-assisted academic writing. However, a core principle is total privacy, ensuring research IP and unreleased documentation isn't sent to OpenAI, Anthropic, or proprietary APIs. We need a way to run powerful enough text generation models (like Phi-4 or Llama-3-8B) client-side.

## Decision
We will use **WebGPU** via **WebLLM** (and potentially local transformers-js for smaller embeddings) to compile and execute open-source quantized models heavily optimized for browser memory limits. 

## Consequences
**Positive:**
- Complete privacy guarantees. The data never leaves the user's origin namespace.
- No rolling server costs for ML infra.
- Works entirely offline (airport, field research, etc.).

**Negative:**
- Huge upfront initial payload (users must download a 4GB+ model into their local cache).
- Heavy GPU dependency (users on older laptops or mobile devices without modern unified memory configurations might experience crashes).
- Requires aggressive management of memory limits (as currently implemented in our settings UI) to throttle context windows and prevent `Out of Memory` errors.
