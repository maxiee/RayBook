// src/shared/dto/BookDTO.ts

import { Schema, Types } from 'mongoose';
import { RendererProcessBook } from '../models/Book';
import { IBook } from '../models/Book';

export class BookDTO {
  static toRendererProcess(book: IBook): RendererProcessBook {
    return {
      _id: book._id.toString(),
      title: book.title,
      subtitle: book.subtitle,
      series: book.series,
      author: book.author,
      translator: book.translator,
      originalTitle: book.originalTitle,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      isbn: book.isbn,
      coverImage: book.coverImage ? {
        data: book.coverImage.data.toString('base64'),
        contentType: book.coverImage.contentType
      } : undefined,
      files: book.files.map(obj => obj.toString())
    };
  }

  static toMongooseDocument(book: Partial<RendererProcessBook>): Partial<IBook> {
    return {
      ...book,
      _id: book._id ? new Types.ObjectId(book._id) : undefined,
      coverImage: book.coverImage ? {
        data: Buffer.from(book.coverImage.data, 'base64'),
        contentType: book.coverImage.contentType
      } : undefined,
      files: book.files?.map(fileId => new Schema.Types.ObjectId(fileId))
    };
  }
}