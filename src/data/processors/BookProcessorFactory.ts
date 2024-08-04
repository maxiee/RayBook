import { BookProcessor } from "./BookProcessor";
import { EpubProcessor } from "./EpubProcessor";
import { PdfProcessor } from "./PdfProcessor";

export class BookProcessorFactory {
  private processors: BookProcessor[] = [
    new EpubProcessor(),
    new PdfProcessor(),
  ];

  getProcessor(filePath: string): BookProcessor | null {
    for (const processor of this.processors) {
      if (processor.canProcess(filePath)) {
        return processor;
      }
    }
    return null;
  }
}
