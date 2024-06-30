import { ApiResponse } from "../../core/ipc/ApiResponse";

export interface IBookCoverService {
  getBookCover(coverImagePath: string): Promise<ApiResponse<string>>;
}
