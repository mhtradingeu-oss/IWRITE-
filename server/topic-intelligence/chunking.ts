/**
 * Document Chunking Engine
 * Splits documents into semantic chunks with metadata preservation
 */

export interface ChunkOptions {
  maxChunkSize?: number;
  overlap?: number;
  preserveHeadings?: boolean;
  preserveSections?: boolean;
}

export interface Chunk {
  content: string;
  index: number;
  heading?: string;
  metadata: {
    startChar: number;
    endChar: number;
    section?: string;
    pageNumber?: number;
  };
}

/**
 * Smart chunking that respects document structure
 * - Preserves headings and sections
 * - Maintains context with overlap
 * - Tracks position metadata
 */
export function chunkDocument(
  content: string,
  options: ChunkOptions = {}
): Chunk[] {
  const {
    maxChunkSize = 1000,
    overlap = 100,
    preserveHeadings = true,
    preserveSections = true,
  } = options;

  const chunks: Chunk[] = [];
  
  // Extract headings and sections
  const sections = preserveSections 
    ? extractSections(content)
    : [{ content, heading: undefined, start: 0 }];

  let chunkIndex = 0;
  
  for (const section of sections) {
    const sectionContent = section.content;
    let startPos = 0;

    while (startPos < sectionContent.length) {
      // Calculate chunk end with overlap consideration
      const endPos = Math.min(
        startPos + maxChunkSize,
        sectionContent.length
      );

      // Try to find a natural break point (period, newline, etc.)
      let actualEnd = endPos;
      if (endPos < sectionContent.length) {
        const breakPoint = findNaturalBreak(
          sectionContent,
          startPos,
          endPos
        );
        if (breakPoint > startPos) {
          actualEnd = breakPoint;
        }
      }

      // Extract chunk content
      const chunkContent = sectionContent.substring(startPos, actualEnd).trim();

      if (chunkContent.length > 0) {
        chunks.push({
          content: chunkContent,
          index: chunkIndex++,
          heading: section.heading,
          metadata: {
            startChar: section.start + startPos,
            endChar: section.start + actualEnd,
            section: section.heading,
          },
        });
      }

      // Move to next chunk with overlap
      startPos = actualEnd - overlap;
      if (startPos >= sectionContent.length) break;
      
      // Ensure we're moving forward
      if (startPos <= 0 && chunks.length > 0) {
        startPos = actualEnd;
      }
    }
  }

  return chunks;
}

/**
 * Extract sections based on headings
 */
function extractSections(content: string): Array<{
  content: string;
  heading?: string;
  start: number;
}> {
  const sections: Array<{
    content: string;
    heading?: string;
    start: number;
  }> = [];

  // Match markdown headings (# ## ###) or numbered sections
  const headingRegex = /^(#{1,6}\s+.+|^\d+\.\s+.+|\n#{1,6}\s+.+|\n\d+\.\s+.+)/gm;
  const matches = Array.from(content.matchAll(headingRegex));

  if (matches.length === 0) {
    return [{ content, heading: undefined, start: 0 }];
  }

  let lastIndex = 0;
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = matches[i + 1];
    const heading = match[0].trim().replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '');
    
    const start = match.index!;
    const end = nextMatch ? nextMatch.index! : content.length;
    
    // Add content before first heading if exists
    if (i === 0 && start > 0) {
      sections.push({
        content: content.substring(0, start),
        heading: undefined,
        start: 0,
      });
    }

    sections.push({
      content: content.substring(start, end),
      heading,
      start,
    });

    lastIndex = end;
  }

  return sections;
}

/**
 * Find natural break point (sentence end, paragraph, etc.)
 */
function findNaturalBreak(
  content: string,
  start: number,
  end: number
): number {
  const searchWindow = content.substring(start, end);
  
  // Look for paragraph breaks first
  const paragraphBreak = searchWindow.lastIndexOf('\n\n');
  if (paragraphBreak > searchWindow.length * 0.5) {
    return start + paragraphBreak + 2;
  }

  // Look for sentence endings
  const sentenceEndings = ['. ', '.\n', '! ', '!\n', '? ', '?\n'];
  let bestBreak = -1;
  
  for (const ending of sentenceEndings) {
    const pos = searchWindow.lastIndexOf(ending);
    if (pos > bestBreak && pos > searchWindow.length * 0.5) {
      bestBreak = pos + ending.length;
    }
  }

  if (bestBreak > 0) {
    return start + bestBreak;
  }

  // Look for line breaks
  const lineBreak = searchWindow.lastIndexOf('\n');
  if (lineBreak > searchWindow.length * 0.5) {
    return start + lineBreak + 1;
  }

  // Last resort: word boundary
  const lastSpace = searchWindow.lastIndexOf(' ');
  if (lastSpace > searchWindow.length * 0.5) {
    return start + lastSpace + 1;
  }

  return end;
}

/**
 * Chunk content with smart overlap for better context preservation
 */
export function chunkWithContext(
  content: string,
  maxSize: number = 1000,
  overlapRatio: number = 0.1
): Chunk[] {
  const overlap = Math.floor(maxSize * overlapRatio);
  return chunkDocument(content, {
    maxChunkSize: maxSize,
    overlap,
    preserveHeadings: true,
    preserveSections: true,
  });
}
