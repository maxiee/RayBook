import { coverImageRepository } from "../../repository/CoverImageRepostory";
import { ApiResponse } from "../../core/ipc/ApiResponse";
import { IBookCoverService } from "./BookCoverServiceInterface";
import { bookFileRepository } from "../../repository/BookfileRepository";
import { localBookCache } from "../LocalBookCacheService";

class BookCoverService implements IBookCoverService {
  async extractBookCover(bookId: Id, fileId: Id): Promise<ApiResponse<string>> {
    try {
      const bookFile = await bookFileRepository.findBookFileById(fileId);
      if (!bookFile) {
        return { success: false, message: "文件不存在" };
      }
      // 使用本地缓存模块获取文件
      const filePath = await localBookCache.getBookFile(bookId, bookFile.path);
      const coverImageUrl = await coverImageRepository.uploadBookCoverImage(
        bookId,
        filePath
      );

      return {
        success: true,
        message: "Successfully extracted cover image",
        payload: coverImageUrl,
      };
    } catch (error) {
      console.error("Error extracting cover image:", error);
      return {
        success: false,
        message: "Failed to extract cover image",
        payload: null,
      };
    }
  }

  async extractLocalBookCover(
    bookId: Id,
    filePath: string
  ): Promise<ApiResponse<string>> {
    try {
      const coverImageUrl = await coverImageRepository.uploadBookCoverImage(
        bookId,
        filePath
      );

      return {
        success: true,
        message: "Successfully extracted cover image",
        payload: coverImageUrl,
      };
    } catch (error) {
      console.error("Error extracting cover image:", error);
      return {
        success: false,
        message: "Failed to extract cover image",
        payload: null,
      };
    }
  }

  async getBookCover(
    coverImagePath: string
  ): Promise<ApiResponse<string | null>> {
    try {
      const coverImage = await coverImageRepository.findCoverImageByPath(
        coverImagePath
      );
      return {
        success: true,
        message: "Successfully fetched cover image",
        payload: coverImage,
      };
    } catch (error) {
      console.error("Error fetching cover image:", error);
      return {
        success: false,
        message: "Failed to fetch cover image",
        payload: null,
      };
    }
  }
}

export const bookCoverService = new BookCoverService();
