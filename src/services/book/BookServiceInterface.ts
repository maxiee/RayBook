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
  ): Promise<ApiResponse<BookWithFiles[]>>;
}

export interface BookWithFiles {
  name: string; // 书名（去除后缀的文件名）
  files: {
    filename: string; // 带有后缀的文件名
    fullPath: string; // 文件的完整路径
  }[];
}
