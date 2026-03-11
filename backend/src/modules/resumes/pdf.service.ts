import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';

@Injectable()
export class PdfService {
  async extractText(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);

      // Use PDFParse class from pdf-parse module
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PDFParse } = require('pdf-parse');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const parser = new PDFParse();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const data = await parser.parse(dataBuffer);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return this.cleanText(data.text as string);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to extract PDF text: ${error.message as string}`);
    }
  }

  private cleanText(text: string): string {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, ' ');

    // Remove common PDF artifacts
    // eslint-disable-next-line no-control-regex
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    // Normalize line breaks
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');

    // Remove multiple consecutive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
  }

  generateThumbnail(_filePath: string): Promise<string | null> {
    // TODO: Implement thumbnail generation using pdf-lib or canvas
    // For now, return null
    return Promise.resolve(null);
  }
}
