import { ApiResponse } from "../../core/ipc/ApiResponse";
import { IBook } from "../../models/Book";

export interface IBookService {
  findBookById(id: Id): Promise<ApiResponse<IBook>>;

  getLatestBooks(
    page: number,
    pageSize: number
  ): Promise<ApiResponse<{ books: IBook[]; total: number }>>;
}
