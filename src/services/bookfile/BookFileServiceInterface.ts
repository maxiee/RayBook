import { ApiResponse } from "../../core/ipc/ApiResponse";
import { IBookFile } from "../../models/BookFile";

export interface IBookFileService {
  uploadBookFile(bookId: Id): Promise<ApiResponse<IBookFile>>;

  getBookFiles(bookId: Id): Promise<ApiResponse<IBookFile[]>>;

  getBookFileContent(bookId: Id): Promise<ApiResponse<Buffer | null>>;
}
