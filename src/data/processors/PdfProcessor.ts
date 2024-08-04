import PdfParse from "pdf-parse";
import { BookProcessor, BookMetadata } from "./BookProcessor";
import fs from "fs";
import { logService } from "../../services/log/LogServiceImpl";

export class PdfProcessor implements BookProcessor {
  canProcess(filePath: string): boolean {
    return filePath.toLowerCase().endsWith(".pdf");
  }

  async extractMetadata(filePath: string): Promise<BookMetadata> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await PdfParse(dataBuffer);

    // PDF metadata extraction is limited, so we'll use what we can
    logService.debug("PDF info", data.info);
    logService.debug("PDF metadata", data.metadata);
    return {
      title: data.info.Title || "",
      author: data.info.Author,
      publisher: data.info.Producer,
      // ISBN and publication year are typically not available in PDF metadata
    };
  }

  async extractCover(filePath: string): Promise<Buffer | null> {
    // PDF cover extraction is complex and beyond the scope of this example
    // For a real implementation, you might need a more specialized library
    return null;
  }
}
