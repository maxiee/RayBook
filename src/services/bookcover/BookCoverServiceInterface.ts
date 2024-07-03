import { ApiResponse } from "../../core/ipc/ApiResponse";

export interface IBookCoverService {
  getBookCover(coverImagePath: string): Promise<ApiResponse<string>>;

  extractBookCover(bookId: Id, fileId: Id): Promise<ApiResponse<string>>;

  extractLocalBookCover(
    bookId: Id,
    filePath: string
  ): Promise<ApiResponse<string>>;
}
