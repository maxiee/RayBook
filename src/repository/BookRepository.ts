import { BookFile, IBookFile } from "../models/BookFile";
import { BookDTO } from "../dto/BookDTO";
import Book, { IBook, RendererProcessBook } from "../models/Book";
import { SchemaTypes } from "mongoose";

export class BookRepository {
    async findById(id: string): Promise<IBook | null> {
        return await Book.findById(id).populate('files').exec();
    }

    async findAll(page: number, pageSize: number): Promise<{ books: IBook[], total: number; }> {
        const skip = (page - 1) * pageSize;
        const [books, total] = await Promise.all([
            Book.find().skip(skip).limit(pageSize).populate('files').exec(),
            Book.countDocuments(),
        ]);
        return { books, total };
    }

    async create(book: Partial<IBook>): Promise<IBook> {
        return await Book.create(book);
    }

    async update(id: string, book: Partial<IBook>): Promise<IBook | null> {
        return await Book.findByIdAndUpdate(id, book, { new: true }).populate('files').exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await Book.findByIdAndDelete(id);
        return !!result;
    }

    async addBookFile(bookId: string, file: Partial<IBookFile>): Promise<IBookFile> {
        const newFile = await BookFile.create({ ...file, book: new SchemaTypes.ObjectId(bookId) });
        await Book.findByIdAndUpdate(bookId, { $push: { files: newFile._id } });
        return newFile;
    }

    async removeBookFile(bookId: string, fileId: string): Promise<boolean> {
        const result = await BookFile.findByIdAndDelete(fileId);
        if (result) {
            await Book.findByIdAndUpdate(bookId, { $pull: { files: new SchemaTypes.ObjectId(fileId) } });
            return true;
        }
        return false;
    }
}