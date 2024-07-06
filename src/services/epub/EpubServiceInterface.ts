import { IMetadata } from "epub2/lib/epub/const";
import { ApiResponse } from "../../core/ipc/ApiResponse";

export interface IEpubService {
  extractMetadata(filePath: string): Promise<ApiResponse<IMetadata>>;
}
