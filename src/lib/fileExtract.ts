// Client-side file text extraction for PDF and Excel files.
// Extracted text is fed into the AI risk analyzer as reference context.

import * as XLSX from "xlsx";

/** Extract text from a PDF file using pdfjs-dist (browser). */
async function extractPdfText(file: File): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist");
  // Use a matching CDN worker to avoid bundler worker config issues.
  const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  const maxPages = Math.min(doc.numPages, 100);
  for (let p = 1; p <= maxPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str ?? "").join(" ");
    parts.push(`[Page ${p}]\n${text}`);
  }
  return parts.join("\n\n");
}

/** Extract text from an Excel file (all sheets, CSV representation). */
async function extractXlsxText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const parts: string[] = [];
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    parts.push(`[Sheet: ${name}]\n${csv}`);
  }
  return parts.join("\n\n");
}

/** Try to extract textual context from a supported file (PDF, XLSX, XLS, plain text). Returns "" if unsupported / fails. */
export async function extractFileText(file: File): Promise<string> {
  try {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      return await extractPdfText(file);
    }
    if (name.endsWith(".xlsx") || name.endsWith(".xls") || file.type.includes("spreadsheet") || file.type.includes("excel")) {
      return await extractXlsxText(file);
    }
    if (file.type.startsWith("text/") || name.endsWith(".txt") || name.endsWith(".csv") || name.endsWith(".md")) {
      return await file.text();
    }
  } catch (e) {
    console.error("extractFileText failed:", e);
  }
  return "";
}
