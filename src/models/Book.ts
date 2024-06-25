import mongoose, { Schema, Document, Types } from 'mongoose';
import { IBookFile } from './BookFile';

export interface IBookBase {
  title: string;
  subtitle?: string;
  series?: string;
  author?: string;
  translator?: string;
  originalTitle?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  coverImage?: {
    data: Buffer | string,
    contentType: string
  };
}

export interface IBook extends IBookBase, Document {
  files: Schema.Types.ObjectId[]
}

const BookSchema: Schema = new Schema({
  title: { type: String, required: true },
  subtitle: String,
  series: String,
  author: String,
  translator: String,
  originalTitle: String,
  publisher: String,
  publicationYear: Number,
  isbn: String,
  coverImage: {
    data: Buffer,
    contentType: String
  },
  files: [{ type: Schema.Types.ObjectId, ref: 'BookFile' }]
});

// 用于渲染进程的类型
export interface RendererProcessBook extends IBookBase {
  _id: string;
  files: string[];
  coverImage?: {
    data: string;
    contentType: string;
  };
};

export default mongoose.model<IBook>('Book', BookSchema);