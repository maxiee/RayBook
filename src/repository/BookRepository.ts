import Book, { IBook } from "../models/Book";
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
    return (await Book.create(book)).toObject();
  }

  async updateBook(book: Partial<IBook>): Promise<IBook | null> {
    return await Book.findByIdAndUpdate(book._id, book, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const result = await Book.findByIdAndDelete(id);
    return !!result;
  }
}

export const bookRepository = new BookRepository();
