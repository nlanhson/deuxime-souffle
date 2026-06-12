// STUB: génération de documents côté client — aucun rendu serveur.
// Produit un vrai Blob (PDF une page ou fichier tableur de démonstration) et
// déclenche un vrai téléchargement navigateur avec le bon nom de fichier.

/** Échappe une ligne pour un flux PDF (Latin-1 + octal pour les accents). */
function pdfEscape(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 63;
    if (ch === '(' || ch === ')' || ch === '\\') out += `\\${ch}`;
    else if (code >= 32 && code <= 126) out += ch;
    else if (code <= 255) out += `\\${code.toString(8).padStart(3, '0')}`;
    else out += '-';
  }
  return out;
}

/** PDF minimal valide, une page A4, texte Helvetica. */
function buildPdfBlob(title: string, lines: string[]): Blob {
  const content: string[] = [];
  content.push('BT /F1 18 Tf 56 780 Td (' + pdfEscape(title) + ') Tj ET');
  lines.forEach((line, i) => {
    content.push(`BT /F1 12 Tf 56 ${744 - i * 20} Td (${pdfEscape(line)}) Tj ET`);
  });
  const stream = content.join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];

  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    body += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i += 1) bytes[i] = body.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: 'application/pdf' });
}

/** STUB: télécharge un document de démonstration (PDF ou export tableur). */
export function downloadStub(filename: string, title: string, lines: string[] = []): void {
  const isPdf = filename.toLowerCase().endsWith('.pdf');
  const blob = isPdf
    ? buildPdfBlob(title, lines)
    : new Blob(['﻿' + [title, '', ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}
