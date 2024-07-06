import { ApiResponse } from "../../core/ipc/ApiResponse";
import { IBookFile } from "../../models/BookFile";

/**
 * Represents a service for managing book files.
 */
export interface IBookFileService {
  /**
   * Uploads a book file by its file path.
   * @param bookId - The ID of the book.
   * @param filePath - The file path of the book file.
   * @returns A promise that resolves to the API response containing the uploaded book file.
   */
  uploadBookFileByPath(
    bookId: Id,
    filePath: string
  ): Promise<ApiResponse<IBookFile>>;

  /**
   * Uploads a book file.
   * @param bookId - The ID of the book.
   * @returns A promise that resolves to the API response containing the uploaded book file.
   */
  uploadBookFile(bookId: Id): Promise<ApiResponse<IBookFile>>;

  /**
   * Retrieves all book files associated with a book.
   * @param bookId - The ID of the book.
   * @returns A promise that resolves to the API response containing an array of book files.
   */
  getBookFiles(bookId: Id): Promise<ApiResponse<IBookFile[]>>;

  /**
   * Retrieves the content of a book file.
   * @param bookId - The ID of the book.
   * @returns A promise that resolves to the API response containing the content of the book file as a Buffer, or null if the file is not found.
   */
  getBookFileContent(bookId: Id): Promise<ApiResponse<Buffer | null>>;

  /**
   * Updates the MD5 hash of a book file.
   * @param fileId - The ID of the file.
   * @param filePath - The file path of the book file.
   * @returns A promise that resolves to the API response containing the updated book file.
   */
  updateFileMd5(fileId: Id, filePath: string): Promise<ApiResponse<IBookFile>>;
}
