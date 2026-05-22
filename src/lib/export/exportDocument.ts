export type ExportFormat = 'html' | 'md' | 'txt' | 'latex';

export function buildExportBlob(
  format: ExportFormat,
  title: string,
  html: string,
  plainText: string
): { blob: Blob; extension: string } {
  let content = '';
  let mimeType = 'text/plain';
  let extension: string = format;

  if (format === 'html') {
    content = `<!DOCTYPE html>\n<html>\n<head>\n<title>${title}</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
    mimeType = 'text/html';
  } else if (format === 'txt') {
    content = plainText;
  } else if (format === 'md') {
    content = `# ${title}\n\n${plainText}`;
    mimeType = 'text/markdown';
  } else if (format === 'latex') {
    content = `\\documentclass{article}\n\\title{${title}}\n\\begin{document}\n\\maketitle\n\n${plainText}\n\\end{document}`;
    mimeType = 'application/x-tex';
    extension = 'tex';
  }

  return {
    blob: new Blob([content], { type: `${mimeType};charset=utf-8;` }),
    extension,
  };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
