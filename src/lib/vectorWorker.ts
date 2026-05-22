import { pipeline, env } from '@xenova/transformers';

// Disable sending telemetry and local models since we just want it to run in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    // using a lightweight embedding model
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      progress_callback: (info: any) => {
        self.postMessage({ type: 'progress', data: info });
      }
    });
  }
  return extractor;
}

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === 'embed') {
    try {
      const { text, chunkId } = payload;
      const getEmbedder = await getExtractor();
      const output = await getEmbedder(text, { pooling: 'mean', normalize: true });
      
      // The output is a Float32Array tensor
      self.postMessage({
        type: 'complete',
        payload: {
          chunkId,
          vector: output.data
        }
      });
    } catch (err: any) {
      self.postMessage({
        type: 'error',
        payload: { error: err.message }
      });
    }
  }
};
