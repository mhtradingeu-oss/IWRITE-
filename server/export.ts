import { Document as DocxDocument, Paragraph, TextRun, AlignmentType } from "docx";
import type { Document, Template } from "@shared/schema";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

/**
 * Export document to Markdown format
 */
export async function exportToMarkdown(
  document: Document,
  template?: Template
): Promise<Buffer> {
  let markdown = "";

  // Add template header if available
  if (template?.header) {
    markdown += `---\n${template.header}\n---\n\n`;
  }

  // Add document title
  markdown += `# ${document.title}\n\n`;

  // Add metadata
  markdown += `*Language: ${document.language.toUpperCase()}*\n`;
  markdown += `*Type: ${document.documentType}*\n`;
  markdown += `*Created: ${new Date(document.createdAt).toLocaleDateString()}*\n\n`;
  markdown += `---\n\n`;

  // Add content
  markdown += document.content;

  // Add template footer if available
  if (template?.footer) {
    markdown += `\n\n---\n${template.footer}\n`;
  }

  return Buffer.from(markdown, "utf-8");
}

/**
 * Export document to DOCX format
 */
export async function exportToDOCX(
  document: Document,
  template?: Template
): Promise<Buffer> {
  const paragraphs: Paragraph[] = [];

  // Add template header if available
  if (template?.header) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: template.header, italics: true, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Add title
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: document.title,
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Add metadata
  const metadata = `Language: ${document.language.toUpperCase()} | Type: ${document.documentType} | Created: ${new Date(document.createdAt).toLocaleDateString()}`;
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: metadata, italics: true, size: 18 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Add separator
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "─".repeat(50) })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Parse content and convert to paragraphs
  // Split by double newline to preserve paragraphs
  const contentParagraphs = document.content.split(/\n\n+/);
  
  contentParagraphs.forEach((para) => {
    if (para.trim()) {
      // Check if it's a heading (starts with #)
      if (para.trim().startsWith("#")) {
        const headingLevel = para.match(/^#+/)?.[0].length || 1;
        const headingText = para.replace(/^#+\s*/, "");
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: headingText,
                bold: true,
                size: Math.max(32 - headingLevel * 4, 20),
              }),
            ],
            spacing: { before: 200, after: 200 },
          })
        );
      } else {
        // Regular paragraph
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: para.trim(), size: 24 })],
            spacing: { after: 150 },
          })
        );
      }
    }
  });

  // Add template footer if available
  if (template?.footer) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "─".repeat(50) })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 200 },
      })
    );
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: template.footer, italics: true, size: 20 })],
        alignment: AlignmentType.CENTER,
      })
    );
  }

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  // Use docx's built-in Packer
  const { Packer } = await import("docx");
  return await Packer.toBuffer(doc);
}

/**
 * Export document to PDF format
 * Note: PDF generation requires converting markdown/HTML to PDF
 */
export async function exportToPDF(
  document: Document,
  template?: Template
): Promise<Buffer> {
  // For PDF export, we'll create an HTML version first
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Georgia', serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .header, .footer {
      text-align: center;
      font-style: italic;
      color: #666;
      padding: 20px 0;
      border-bottom: 1px solid #ddd;
      margin-bottom: 30px;
    }
    .footer {
      border-top: 1px solid #ddd;
      border-bottom: none;
      margin-top: 30px;
      margin-bottom: 0;
    }
    h1 {
      text-align: center;
      color: #222;
      margin-bottom: 10px;
    }
    .metadata {
      text-align: center;
      font-style: italic;
      color: #666;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    .content {
      text-align: justify;
    }
    h2, h3, h4 {
      margin-top: 30px;
      color: #444;
    }
    p {
      margin: 15px 0;
    }
  </style>
</head>
<body>
`;

  // Add template header
  if (template?.header) {
    html += `<div class="header">${template.header}</div>`;
  }

  // Add title
  html += `<h1>${document.title}</h1>`;

  // Add metadata
  html += `<div class="metadata">`;
  html += `Language: ${document.language.toUpperCase()} | `;
  html += `Type: ${document.documentType} | `;
  html += `Created: ${new Date(document.createdAt).toLocaleDateString()}`;
  html += `</div>`;

  // Convert markdown content to HTML
  const contentHtml = md.render(document.content);
  html += `<div class="content">${contentHtml}</div>`;

  // Add template footer
  if (template?.footer) {
    html += `<div class="footer">${template.footer}</div>`;
  }

  html += `
</body>
</html>
`;

  // For now, return HTML as Buffer
  // In a production environment, you would use a library like puppeteer or pdf-lib
  // to convert HTML to actual PDF
  return Buffer.from(html, "utf-8");
}
