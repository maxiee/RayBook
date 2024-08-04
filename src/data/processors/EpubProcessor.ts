import EPub from "epub2";
import { BookProcessor, BookMetadata } from "./BookProcessor";

export class EpubProcessor implements BookProcessor {
  canProcess(filePath: string): boolean {
    return filePath.toLowerCase().endsWith(".epub");
  }

  async extractMetadata(filePath: string): Promise<BookMetadata> {
    const epub: EPub = await EPub.createAsync(filePath);
    const metadata = epub.metadata;
    return {
      title: metadata.title || "",
      author: metadata.creator,
      publisher: metadata.publisher,
      isbn: metadata.ISBN,
      publicationYear: metadata.date
        ? new Date(metadata.date).getFullYear()
        : undefined,
    };
  }

  async extractCover(filePath: string): Promise<Buffer | null> {
    const epub: EPub = await EPub.createAsync(filePath);
    const coverPath = epub.metadata.cover;
    if (!coverPath) return null;

    return new Promise((resolve, reject) => {
      epub.getImage(coverPath, (err: Error, data: Buffer, mimeType: string) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}
