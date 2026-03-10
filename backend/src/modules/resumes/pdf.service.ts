import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class PdfService {
  async extractText(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return this.cleanText(data.text);
    } catch (error) {
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }

  private cleanText(text: string): string {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, ' ');

    // Remove common PDF artifacts
    cleaned = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    // Normalize line breaks
    cleaned = cleaned.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\r/g, '\n');

    // Remove multiple consecutive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
  }

  async generateThumbnail(filePath: string): Promise<string | null> {
    // TODO: Implement thumbnail generation using pdf-lib or canvas
    // For now, return null
    return null;
  }
}
