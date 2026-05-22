import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { chunkText } from '../lib/rag/chunking';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

self.onmessage = async (event) => {
  const { type, payload } = event.data;

  if (type === 'parse') {
    try {
      const { file, documentId } = payload;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n';
        
        self.postMessage({ type: 'progress', data: { page: i, total: pdf.numPages, documentId } });
      }

      const chunks = chunkText(fullText, 512, 64);

      const chunkObjects = chunks.map((text, i) => ({
        id: `${documentId}-chunk-${i}`,
        documentId,
        chunkIndex: i,
        text
      }));
      
      self.postMessage({
        type: 'complete',
        payload: {
          documentId,
          chunks: chunkObjects
        }
      });
    } catch (err) {
      self.postMessage({
        type: 'error',
        payload: { error: err instanceof Error ? err.message : String(err) }
      });
    }
  }
};
