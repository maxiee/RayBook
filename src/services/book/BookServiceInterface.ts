import { ApiResponse } from "../../core/ipc/ApiResponse";
import { IBook } from "../../models/Book";

export interface IBookService {
  addBook(): Promise<ApiResponse<IBook>>;

  updateBook(book: Partial<IBook>): Promise<ApiResponse<IBook | null>>;

  findBookById(id: Id): Promise<ApiResponse<IBook>>;

  getLatestBooks(
    page: number,
    pageSize: number
  ): Promise<ApiResponse<{ books: IBook[]; total: number }>>;

  batchParseBooksInDirectory(
    directory: string
  ): Promise<ApiResponse<Map<string, string[]>>>;
}
