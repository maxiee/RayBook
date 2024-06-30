import { coverImageRepository } from "../../repository/CoverImageRepostory";
import { ApiResponse } from "../../core/ipc/ApiResponse";
import { IBookCoverService } from "./BookCoverServiceInterface";

class BookCoverService implements IBookCoverService {
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
