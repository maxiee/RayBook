import EPub from "epub2";
import { IMetadata } from "epub2/lib/epub/const";
import { ApiResponse } from "../../core/ipc/ApiResponse";

class EpubService {
  async extractMetadata(filePath: string): Promise<ApiResponse<IMetadata>> {
    try {
      const epub: EPub = await EPub.createAsync(filePath);
      const metadata = epub.metadata;
      return {
        success: true,
        message: "Successfully extracted metadata",
        payload: metadata,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to extract metadata",
        payload: null,
      };
    }
  }
}

export const epubService = new EpubService();
