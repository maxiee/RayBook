import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BookFile, IBookFile } from "../../models/BookFile";
import { IBookFileService } from "./BookFileServiceInterface";
import { bookFileRepository } from "../../repository/BookfileRepository";
import { dialog } from "electron";
import { ApiResponse } from "../../core/ipc/ApiResponse";
import { localBookCache } from "../LocalBookCacheService";
import { logService } from "../log/LogServiceImpl";

class BookFileService implements IBookFileService {
  async getBookFileContent(bookId: Id): Promise<ApiResponse<Buffer | null>> {
    try {
      const bookFiles = await bookFileRepository.findBookFilesByBookId(bookId);
      if (bookFiles.length === 0) {
        return { success: false, message: "No book file found", payload: null };
      }
      const filePath = await localBookCache.getBookFile(
        bookId,
        bookFiles[0].path
      );
      const content = fs.readFileSync(filePath);
      return {
        success: true,
        message: "Successfully fetched book content",
        payload: content,
      };
    } catch (error) {
      logService.error("Error getting local book path:", error);
      return {
        success: false,
        message: "Failed to get local book content",
        payload: null,
      };
    }
  }

  async getBookFiles(bookId: Id): Promise<ApiResponse<IBookFile[]>> {
    try {
      const bookFiles = await bookFileRepository.findBookFilesByBookId(bookId);
      return {
        success: true,
        message: "Successfully fetched book files",
        payload: bookFiles,
      };
    } catch (error) {
      logService.error("Failed to fetch book files", error);
      return {
        success: false,
        message: "Failed to fetch book files",
        payload: [],
      };
    }
  }

  async uploadBookFileByPath(
    bookId: Id,
    filePath: string
  ): Promise<ApiResponse<IBookFile>> {
    try {
      const fileName = path.basename(filePath);
      const objectName = `books/${Date.now()}_${fileName}`;
      const newUploadBookFile = await bookFileRepository.uploadBookFile(
        bookId,
        filePath,
        fileName,
        objectName
      );

      if (!newUploadBookFile) {
        return null;
      }

      return {
        success: true,
        message: "Book file uploaded successfully",
        payload: newUploadBookFile,
      };
    } catch (error) {
      logService.error("Error uploading file:", error);
      return {
        success: false,
        message: "Failed to upload book file",
        payload: null,
      };
    }
  }

  async uploadBookFile(bookId: Id): Promise<ApiResponse<IBookFile>> {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Book Files", extensions: ["epub", "pdf", "mobi"] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return {
          success: false,
          message: "未选择文件",
          payload: null,
        };
      }

      const filePath = result.filePaths[0];
      const fileName = path.basename(filePath);
      const objectName = `books/${Date.now()}_${fileName}`;
      const newUploadBookFile = await bookFileRepository.uploadBookFile(
        bookId,
        filePath,
        fileName,
        objectName
      );

      if (!newUploadBookFile) {
        return {
          success: false,
          message: "Failed to upload book file",
          payload: null,
        };
      }

      return {
        success: true,
        message: "Book file uploaded successfully",
        payload: newUploadBookFile,
      };
    } catch (error) {
      logService.error("Error uploading file:", error);
      return {
        success: false,
        message: "Failed to upload book file: " + error.message,
        payload: null,
      };
    }
  }

  async batchCheckSHA256(
    filePaths: string[]
  ): Promise<ApiResponse<{ [filePath: string]: string | null }>> {
    try {
      const result: { [filePath: string]: string | null } = {};
      for (const filePath of filePaths) {
        const sha256 = await bookFileRepository.calculateSha256(filePath);
        const existingFile = await bookFileRepository.findBookFileBySha256(
          sha256
        );
        result[filePath] = existingFile ? sha256 : null;
      }
      return {
        success: true,
        message: "SHA256 检查完成",
        payload: result,
      };
    } catch (error) {
      logService.error("批量 SHA256 检查出错:", error);
      return {
        success: false,
        message: "批量 SHA256 检查失败",
        payload: null,
      };
    }
  }

  async getBookFilesWithoutSha256(): Promise<ApiResponse<IBookFile[]>> {
    try {
      const bookFiles = await BookFile.find({
        sha256: { $exists: false },
      }).lean();
      return {
        success: true,
        message: "Successfully retrieved book files without SHA256",
        payload: bookFiles,
      };
    } catch (error) {
      logService.error("Error in getBookFilesWithoutSha256:", error);
      return {
        success: false,
        message: "Failed to retrieve book files without SHA256",
        payload: [],
      };
    }
  }

  async calculateAndUpdateSha256(
    bookId: Id,
    fileId: Id
  ): Promise<ApiResponse<IBookFile>> {
    try {
      const bookFile = await bookFileRepository.findBookFileById(fileId);
      if (!bookFile) {
        return { success: false, message: "文件不存在", payload: null };
      }

      const filePath = await localBookCache.getBookFile(bookId, bookFile.path);
      logService.debug("Calculating SHA256 for file:", filePath);
      const updatedBookFile = await bookFileRepository.updateFileSha256(
        fileId,
        filePath
      );
      logService.debug("Updated book file:", updatedBookFile.filename);

      if (!updatedBookFile) {
        logService.debug("Failed to update SHA256");
        return { success: false, message: "更新SHA256失败", payload: null };
      }

      logService.debug("Successfully updated SHA256");
      return {
        success: true,
        message: "成功计算并更新SHA256",
        payload: updatedBookFile,
      };
    } catch (error) {
      logService.error("计算或更新SHA256时出错:", error);
      return { success: false, message: "计算或更新SHA256失败", payload: null };
    }
  }
}

export const bookFileService = new BookFileService();
