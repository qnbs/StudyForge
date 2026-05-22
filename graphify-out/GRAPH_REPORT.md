# Graph Report - StudyForge  (2026-05-22)

## Corpus Check
- 66 files · ~29,435 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 153 nodes · 118 edges · 11 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]

## God Nodes (most connected - your core abstractions)
1. `RAGService` - 12 edges
2. `queryRAGHybrid()` - 6 edges
3. `queryRAGVectors()` - 5 edges
4. `loadKeys()` - 4 edges
5. `ErrorBoundary` - 4 edges
6. `onExport()` - 3 edges
7. `deleteVectorFromOPFS()` - 3 edges
8. `deriveKey()` - 3 edges
9. `cosineSimilarity()` - 3 edges
10. `scoreBM25()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `queryRAGVectors()` --calls--> `loadVectorFromOPFS()`  [INFERRED]
  src/lib/rag/queryRAG.ts → src/lib/opfs.ts
- `queryRAGHybrid()` --calls--> `queryRAGVectors()`  [INFERRED]
  src/lib/rag/hybridSearch.ts → src/lib/rag/queryRAG.ts
- `AgentEditor()` --calls--> `useLLM()`  [INFERRED]
  src/components/agents/AgentEditor.tsx → src/contexts/LLMContext.tsx
- `onExport()` --calls--> `buildExportBlob()`  [INFERRED]
  src/components/phases/WritingPhase.tsx → src/lib/export/exportDocument.ts
- `onExport()` --calls--> `downloadBlob()`  [INFERRED]
  src/components/phases/WritingPhase.tsx → src/lib/export/exportDocument.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.27
Nodes (2): deleteVectorFromOPFS(), RAGService

### Community 1 - "Community 1"
Cohesion: 0.2
Nodes (5): cosineSimilarity(), loadVectorFromOPFS(), mergeTopK(), queryRAGVectors(), handleSendMessage()

### Community 2 - "Community 2"
Cohesion: 0.29
Nodes (3): buildExportBlob(), downloadBlob(), onExport()

### Community 3 - "Community 3"
Cohesion: 0.43
Nodes (5): scoreBM25(), tokenize(), fuseRankings(), loadChunksForQuery(), queryRAGHybrid()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (2): AgentEditor(), useLLM()

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (2): IngestQueue, handleFileUpload()

### Community 7 - "Community 7"
Cohesion: 0.7
Nodes (4): handleSaveKeys(), handleSetMaster(), handleUnlock(), loadKeys()

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (1): ErrorBoundary

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (2): resolveModelPresetKey(), resolveModelUrl()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (1): StudyForgeDatabase

### Community 13 - "Community 13"
Cohesion: 0.83
Nodes (3): decryptApiKey(), deriveKey(), encryptApiKey()

## Knowledge Gaps
- **Thin community `Community 0`** (12 nodes): `deleteVectorFromOPFS()`, `RAGService`, `.constructor()`, `.deleteDocument()`, `.deleteSourceArtifacts()`, `.embedOneChunk()`, `.ingestSourceInternal()`, `.initWorkers()`, `.listDocuments()`, `.parsePdf()`, `.processChunks()`, `ragService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (6 nodes): `AgentEditor()`, `gpuLayerCount()`, `LLMProvider()`, `useLLM()`, `AgentEditor.tsx`, `LLMContext.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (6 nodes): `IngestQueue`, `.enqueue()`, `handleFileUpload()`, `.ingestSource()`, `LocalLibrary.tsx`, `ingestQueue.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (5 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.getDerivedStateFromError()`, `.render()`, `ErrorBoundary.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (4 nodes): `getOptimalModel()`, `resolveModelPresetKey()`, `resolveModelUrl()`, `modelConfig.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (4 nodes): `initializeDatabase()`, `StudyForgeDatabase`, `.constructor()`, `db.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `RAGService` connect `Community 0` to `Community 1`, `Community 5`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `queryRAGHybrid()` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `queryRAGVectors()` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `queryRAGHybrid()` (e.g. with `scoreBM25()` and `queryRAGVectors()`) actually correct?**
  _`queryRAGHybrid()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `queryRAGVectors()` (e.g. with `loadVectorFromOPFS()` and `cosineSimilarity()`) actually correct?**
  _`queryRAGVectors()` has 3 INFERRED edges - model-reasoned connections that need verification._