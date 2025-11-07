import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = "";

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // Memory safety: Limit buffer size
    const MAX_BUFFER_SIZE = 10 * 1024 * 1024; // 10MB
    if (buffer.length > MAX_BUFFER_SIZE) {
      throw new Error(`DOCX file too large: ${buffer.length} bytes. Maximum allowed: ${MAX_BUFFER_SIZE} bytes`);
    }

    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    
    // Memory safety: Limit extracted text
    const MAX_TEXT_SIZE = 500000; // 500KB
    if (text.length > MAX_TEXT_SIZE) {
      console.warn(`DOCX text too large (${text.length} chars), truncating to ${MAX_TEXT_SIZE}`);
      return text.substring(0, MAX_TEXT_SIZE);
    }
    
    return text;
  } catch (error) {
    console.error("Error extracting DOCX text:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

export async function extractTextFromCSV(buffer: Buffer): Promise<string> {
  try {
    // Memory safety: Limit buffer size
    const MAX_BUFFER_SIZE = 10 * 1024 * 1024; // 10MB
    if (buffer.length > MAX_BUFFER_SIZE) {
      throw new Error(`CSV file too large: ${buffer.length} bytes. Maximum allowed: ${MAX_BUFFER_SIZE} bytes`);
    }

    const workbook = XLSX.read(buffer, { type: "buffer", sheetRows: 1000 }); // Limit rows to prevent OOM
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    // Memory safety: Limit extracted text size
    const MAX_TEXT_SIZE = 500000; // 500KB
    if (csv.length > MAX_TEXT_SIZE) {
      console.warn(`CSV text too large (${csv.length} chars), truncating to ${MAX_TEXT_SIZE}`);
      return csv.substring(0, MAX_TEXT_SIZE);
    }
    
    return csv;
  } catch (error) {
    console.error("Error extracting CSV text:", error);
    throw new Error("Failed to extract text from CSV");
  }
}

export async function extractTextFromXLSX(buffer: Buffer): Promise<string> {
  try {
    // Memory safety: Limit buffer size
    const MAX_BUFFER_SIZE = 10 * 1024 * 1024; // 10MB
    if (buffer.length > MAX_BUFFER_SIZE) {
      throw new Error(`XLSX file too large: ${buffer.length} bytes. Maximum allowed: ${MAX_BUFFER_SIZE} bytes`);
    }

    const workbook = XLSX.read(buffer, { type: "buffer", sheetRows: 1000 }); // Limit rows per sheet
    let fullText = "";
    const MAX_TEXT_SIZE = 500000; // 500KB total

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      fullText += `Sheet: ${sheetName}\n${csv}\n\n`;
      
      // Stop if we've exceeded the size limit
      if (fullText.length > MAX_TEXT_SIZE) {
        console.warn(`XLSX text too large (${fullText.length} chars), truncating to ${MAX_TEXT_SIZE}`);
        return fullText.substring(0, MAX_TEXT_SIZE);
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error extracting XLSX text:", error);
    throw new Error("Failed to extract text from XLSX");
  }
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    return await extractTextFromPDF(buffer);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await extractTextFromDOCX(buffer);
  } else if (mimeType === "text/csv") {
    return await extractTextFromCSV(buffer);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return await extractTextFromXLSX(buffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
