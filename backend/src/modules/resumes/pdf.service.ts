import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';

@Injectable()
export class PdfService {
  async extractText(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);

      // Use PDFParse class from pdf-parse module
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PDFParse, VerbosityLevel } = require('pdf-parse');
      
      // Create parser with options and data
      const parser = new PDFParse({
        data: dataBuffer,
        verbosity: VerbosityLevel.ERRORS,
      });
      
      // Load and parse the PDF
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await parser.load();
      
      // Get the text - returns an object with .text property
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await parser.getText();
      
      // Extract the text string from the result object
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const text = result?.text || '';

      return this.cleanText(text as string);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Failed to extract PDF text: ${error.message as string}`);
    }
  }

  private cleanText(text: string): string {
    // Ensure text is a string
    if (typeof text !== 'string') {
      return '';
    }

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
