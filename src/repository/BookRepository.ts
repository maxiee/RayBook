import { BookFile, IBookFile } from "../models/BookFile";
import Book, { IBook } from "../models/Book";
import { SchemaTypes } from "mongoose";
import { toObjectId } from "../utils/DtoUtils";

class BookRepository {
  async findBookById(id: Id): Promise<IBook | null> {
    console.log("BookRepository findBookById id: ", id);
    return await Book.findById(toObjectId(id)).lean();
  }

  async findAll(
    page: number,
    pageSize: number
  ): Promise<{ books: IBook[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [books, total] = await Promise.all([
      Book.find().skip(skip).limit(pageSize).lean(),
      Book.countDocuments(),
    ]);
    return { books, total };
  }

  async createNewBook(book: Partial<IBook>): Promise<IBook> {
    return await Book.create(book);
  }

  async updateBook(book: Partial<IBook>): Promise<IBook | null> {
    return await Book.findByIdAndUpdate(book._id, book, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Book.findByIdAndDelete(id);
    return !!result;
  }

  async addBookFile(
    bookId: string,
    file: Partial<IBookFile>
  ): Promise<IBookFile> {
    const newFile = await BookFile.create({
      ...file,
      book: new SchemaTypes.ObjectId(bookId),
    });
    await Book.findByIdAndUpdate(bookId, { $push: { files: newFile._id } });
    return newFile;
  }

  async removeBookFile(bookId: string, fileId: string): Promise<boolean> {
    const result = await BookFile.findByIdAndDelete(fileId);
    if (result) {
      await Book.findByIdAndUpdate(bookId, {
        $pull: { files: new SchemaTypes.ObjectId(fileId) },
      });
      return true;
    }
    return false;
  }
}

export const bookRepository = new BookRepository();
