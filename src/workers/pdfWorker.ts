import * as pdfjsLib from 'pdfjs-dist';
import { chunkText } from '../lib/rag/chunking';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

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
        
        self.postMessage({ type: 'progress', data: { page: i, total: pdf.numPages } });
      }

      const chunks = chunkText(fullText, 1000, 200);

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
          fullText,
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
