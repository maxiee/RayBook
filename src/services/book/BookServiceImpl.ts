import { bookRepository } from "../../repository/BookRepository";
import { IBook } from "../../models/Book";
import { IBookService } from "./BookServiceInterface";
import { ApiResponse } from "../../core/ipc/ApiResponse";

class BookService implements IBookService {
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
}

export const bookService = new BookService();
