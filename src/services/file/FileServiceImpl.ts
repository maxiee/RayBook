import { dialog } from "electron";
import { IFileService } from "./FileServiceInterface";
import { ApiResponse } from "../../core/ipc/ApiResponse";
import { logService } from "../log/LogServiceImpl";

class FileService implements IFileService {
  async selectDirectory(): Promise<ApiResponse<string>> {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return {
          success: false,
          message: "Directory selection was cancelled",
          payload: null,
        };
      }

      return {
        success: true,
        message: "Directory selected successfully",
        payload: result.filePaths[0],
      };
    } catch (error) {
      logService.error("Error selecting directory:", error);
      return {
        success: false,
        message: "Failed to select directory",
        payload: null,
      };
    }
  }
}

export const fileService = new FileService();
