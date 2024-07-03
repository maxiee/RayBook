import fs from "fs";
import path from "path";
import { IBookFile } from "../../models/BookFile";
import { IBookFileService } from "./BookFileServiceInterface";
import { bookFileRepository } from "../../repository/BookfileRepository";
import { dialog } from "electron";
import { ApiResponse } from "../../core/ipc/ApiResponse";
import { localBookCache } from "../LocalBookCacheService";

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
      console.error("Error getting local book path:", error);
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
      console.error("Failed to fetch book files", error);
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
      console.error("Error uploading file:", error);
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
        return null;
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
        return null;
      }

      return {
        success: true,
        message: "Book file uploaded successfully",
        payload: newUploadBookFile,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        message: "Failed to upload book file",
        payload: null,
      };
    }
  }
}

export const bookFileService = new BookFileService();
