import path from "path";
import { bookRepository } from "../../repository/BookRepository";
import { IBook } from "../../models/Book";
import { IBookService } from "./BookServiceInterface";
import { ApiResponse } from "../../core/ipc/ApiResponse";
import { dialog } from "electron";
import { epubMetadaService } from "../EpubMetadataService";
import { bookFileRepository } from "../../repository/BookfileRepository";
import { coverImageRepository } from "../../repository/CoverImageRepostory";

class BookService implements IBookService {
  async addBook(): Promise<ApiResponse<IBook>> {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Ebooks", extensions: ["epub"] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: "No file selected", payload: null };
      }

      const filePath = result.filePaths[0];
      const fileName = path.basename(filePath);
      const objectName = `books/${Date.now()}_${fileName}`;
      console.log("add-new-book filePath:", filePath);
      console.log("add-new-book objectName:", objectName);
      console.log("add-new-book fileName:", fileName);

      const metadata = await epubMetadaService.extractMetadata(filePath);
      console.log("add-new-book metadata:", metadata);

      const newBook = await bookRepository.createNewBook({
        title: metadata.title,
        author: metadata.creator,
        publisher: metadata.publisher,
        isbn: metadata.ISBN,
        publicationYear: new Date(metadata.date).getFullYear(),
      });
      console.log("add-new-book newBook:", newBook);

      const newUploadBookFile = await bookFileRepository.uploadBookFile(
        newBook._id,
        filePath,
        fileName,
        objectName
      );
      console.log("add-new-book newUploadBookFile:", newUploadBookFile);

      const coverIamgeUrl = await coverImageRepository.uploadBookCoverImage(
        newBook._id,
        filePath
      );
      console.log("add-new-book coverIamgeUrl:", coverIamgeUrl);

      return {
        success: true,
        message: "Successfully added book",
        payload: newBook,
      };
    } catch (error) {
      console.error("Failed to add book", error);
      return {
        success: false,
        message: "Failed to add book",
        payload: null,
      };
    }
  }

  async updateBook(book: Partial<IBook>): Promise<ApiResponse<IBook>> {
    try {
      const bookUpdated = await bookRepository.updateBook(book);
      return {
        success: true,
        message: "Successfully updated book",
        payload: bookUpdated,
      };
    } catch (error) {
      console.error("Failed to update book", error);
      return {
        success: false,
        message: "Failed to update book",
        payload: null,
      };
    }
  }
  /**
   * Retrieves the latest books based on the specified page and page size.
   * @param page - The page number.
   * @param pageSize - The number of books per page.
   * @returns A promise that resolves to an ApiResponse object containing the fetched books and total count.
   */
  async getLatestBooks(
    page: number,
    pageSize: number
  ): Promise<ApiResponse<{ books: IBook[]; total: number }>> {
    // 查询书籍
    try {
      const { books, total } = await bookRepository.findAll(page, pageSize);
      return {
        success: true,
        message: "Successfully fetched latest books",
        payload: { books, total },
      };
    } catch (error) {
      console.error("Failed to fetch latest books", error);
      return {
        success: false,
        message: "Failed to fetch latest books",
        payload: { books: [], total: 0 },
      };
    }
  }

  /**
   * Finds a book by its ID.
   * @param id - The ID of the book to find.
   * @returns A promise that resolves to the found book, or null if not found.
   */
  async findBookById(id: Id): Promise<ApiResponse<IBook>> {
    try {
      return {
        success: true,
        message: "Successfully fetched book details",
        payload: await bookRepository.findBookById(id),
      };
    } catch (error) {
      console.error("Failed to fetch book details", error);
      return {
        success: false,
        message: "Failed to fetch book details",
        payload: null,
      };
    }
  }

  batchParseBooksInDirectory(
    directory: string
  ): Promise<ApiResponse<Map<string, string[]>>> {
    throw new Error("Method not implemented.");
  }
}

export const bookService = new BookService();
