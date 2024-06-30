import { bookRepository } from "../../repository/BookRepository";
import { IBook } from "../../models/Book";
import { IBookService } from "./BookServiceInterface";
import { ApiResponse } from "../../core/ipc/ApiResponse";

class BookService implements IBookService {

    /**
    * Finds a book by its ID.
    * @param id - The ID of the book to find.
    * @returns A promise that resolves to the found book, or null if not found.
    */
    async findBookById(id: Id): Promise<ApiResponse<IBook>> {
        try {
            return {
                success: true,
                message: 'Successfully fetched book details',
                payload: await bookRepository.findBookById(id)
            };
        } catch (error) {
            console.error('Failed to fetch book details', error);
            return {
                success: false,
                message: 'Failed to fetch book details',
                payload: null
            };
        }
    }
}

export const bookService = new BookService();