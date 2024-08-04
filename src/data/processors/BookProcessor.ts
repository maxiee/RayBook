export interface BookMetadata {
  title: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  publicationYear?: number;
}

export interface BookProcessor {
  canProcess(filePath: string): boolean;
  extractMetadata(filePath: string): Promise<BookMetadata>;
  extractCover(filePath: string): Promise<Buffer | null>;
}
