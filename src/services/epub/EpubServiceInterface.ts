import { IMetadata } from "epub2/lib/epub/const";

export interface IEpubService {
  extractMetadata(filePath: string): Promise<IMetadata>;
}
