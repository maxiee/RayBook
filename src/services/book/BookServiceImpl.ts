import path from "path";
import fs from "fs";
import { bookRepository } from "../../repository/BookRepository";
import { IBook } from "../../models/Book";
import { BookWithFiles, IBookService } from "./BookServiceInterface";
import { ApiResponse } from "../../core/ipc/ApiResponse";
import { dialog } from "electron";
import { bookFileRepository } from "../../repository/BookfileRepository";
import { coverImageRepository } from "../../repository/CoverImageRepostory";
import { epubService } from "../epub/EpubServiceImpl";

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

      const metadata = await epubService.extractMetadata(filePath);
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

  /**
   * Parses the books in the specified directory and returns the result as an ApiResponse.
   * @param directory - The directory path where the books are located.
   * @returns A Promise that resolves to an ApiResponse containing the parsed books with their files.
   */
  async batchParseBooksInDirectory(
    directory: string
  ): Promise<ApiResponse<BookWithFiles[]>> {
    try {
      const bookMap = new Map<string, string[]>();
      const files = await fs.promises.readdir(directory);

      // 第一步：收集文件
      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.promises.stat(filePath);

        if (stats.isFile()) {
          const fileNameWithoutExt = path.parse(file).name.toLowerCase();
          const fileExt = path.extname(file).toLowerCase();

          if (this.supportedEbookFormats.has(fileExt)) {
            if (!bookMap.has(fileNameWithoutExt)) {
              bookMap.set(fileNameWithoutExt, []);
            }
            bookMap.get(fileNameWithoutExt).push(filePath);
          }
        }
      }

      // Sort files for each book, prioritizing EPUB format
      for (const [bookName, files] of bookMap) {
        files.sort((a, b) => {
          if (path.extname(a).toLowerCase() === ".epub") return -1;
          if (path.extname(b).toLowerCase() === ".epub") return 1;
          return 0;
        });
      }

      // 第二步：处理每本书
      const booksWithFiles: BookWithFiles[] = [];
      for (const [bookName, files] of bookMap) {
        const bookWithFiles: BookWithFiles = {
          name: bookName,
          files: files.map((filePath) => ({
            filename: path.basename(filePath),
            fullPath: filePath,
          })),
        };

        booksWithFiles.push(bookWithFiles);
      }

      return {
        success: true,
        message: "Successfully parsed books in directory",
        payload: booksWithFiles,
      };
    } catch (error) {
      console.error("Error parsing books in directory:", error);
      return {
        success: false,
        message: "Failed to parse books in directory",
        payload: [],
      };
    }
  }

  private readonly supportedEbookFormats = new Set([
    ".epub", // Electronic Publication - open e-book standard by International Digital Publishing Forum (IDPF)
    ".pdf", // Portable Document Format - developed by Adobe
    ".mobi", // Mobipocket e-book format
    ".azw", // Amazon Kindle e-book format
    ".azw3", // Enhanced version of AZW with better support for complex layouts
    ".fb2", // FictionBook - open XML-based e-book format
    ".djvu", // DjVu - format specialized for storing scanned documents
    ".txt", // Plain text format
    ".rtf", // Rich Text Format - a formatted text format
    ".chm", // Microsoft Compiled HTML Help - compressed HTML format
    ".cbr", // Comic Book Archive file (RAR compressed)
    ".cbz", // Comic Book Archive file (ZIP compressed)
    ".docx", // Microsoft Word Open XML Format
    ".lit", // Microsoft Reader format (deprecated)
    ".prc", // Palm Resource Compiler format, often used for Mobipocket books
    ".pdb", // Palm Database format, used for various e-book formats
    ".htm", // HyperText Markup Language file
    ".html", // HyperText Markup Language file
    ".lrf", // Sony Portable Reader format
    ".lrx", // Sony Reader Digital Book file
    ".pmlz", // Palm Markup Language Compressed format
    ".oxps", // Open XML Paper Specification
    ".xps", // XML Paper Specification
  ]);
}

export const bookService = new BookService();
