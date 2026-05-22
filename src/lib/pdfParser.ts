import * as pdfjsLib from 'pdfjs-dist';

// pdfjs-dist needs the worker to parse PDFs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\\n';
  }
  
  return fullText;
}

export function chunkText(text: string, chunkSize: number = 300, overlap: number = 50): string[] {
  // Simple word-based chunker
  const words = text.split(/\\s+/);
  const chunks = [];
  let i = 0;
  
  while (i < words.length) {
    const EndIndex = Math.min(i + chunkSize, words.length);
    chunks.push(words.slice(i, EndIndex).join(' '));
    i += chunkSize - overlap;
  }
  
  return chunks;
}
