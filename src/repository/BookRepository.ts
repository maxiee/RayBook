import { logService } from "../services/log/LogServiceImpl";
import Book, { IBook } from "../models/Book";
import { toObjectId } from "../utils/DtoUtils";

class BookRepository {
  async findBookById(id: Id): Promise<IBook | null> {
    logService.info(
      "BookRepository findBookById id: ",
      toObjectId(id).toHexString()
    );
    return await Book.findById(toObjectId(id)).lean();
  }

  async findAll(
    page: number,
    pageSize: number
  ): Promise<{ books: IBook[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [books, total] = await Promise.all([
      Book.find().sort({ _id: -1 }).skip(skip).limit(pageSize).lean(),
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

  async findByWeixinBookKey(bookKey: string): Promise<IBook | null> {
    return await Book.findOne({ weixinBookKey: bookKey }).lean();
  }
}

export const bookRepository = new BookRepository();
