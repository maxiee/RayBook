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

  findBookFileByBookFileId(bookFileId: Id): Promise<ApiResponse<IBookFile>>;

  /**
   * Retrieves the content of a book file.
   * @param bookFileId - The ID of the book.
   * @returns A promise that resolves to the API response containing the content of the book file as a Buffer, or null if the file is not found.
   */
  getBookFileContent(bookId: Id, bookFileId: Id): Promise<ApiResponse<Buffer | null>>;

  batchCheckSHA256(
    filePaths: string[]
  ): Promise<ApiResponse<{ [filePath: string]: string | null }>>;

  getBookFilesWithoutSha256(): Promise<ApiResponse<IBookFile[]>>;

  calculateAndUpdateSha256(
    bookId: Id,
    fileId: Id
  ): Promise<ApiResponse<IBookFile>>;

  updateBookFileLocation(fileId: Id, location: string): Promise<ApiResponse<IBookFile>>;
}
