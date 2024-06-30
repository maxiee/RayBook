import { ApiResponse } from "../../core/ipc/ApiResponse";
import { IBookFile } from "../../models/BookFile";

export interface IBookFileService {
   uploadBookFile(bookId: Id): Promise<ApiResponse<IBookFile>>;
}