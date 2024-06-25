import mongoose, { Schema, Document } from 'mongoose';
import { IBook } from './Book';

// BookFile 模型
export interface IBookFileBase {
  filename: string;
  format: string;
  path: string;
  size: number;
  book: Schema.Types.ObjectId | string;
}

export interface IBookFile extends IBookFileBase, Document {
  _id: Schema.Types.ObjectId;
  book: Schema.Types.ObjectId;
}

const BookFileSchema: Schema = new Schema({
  filename: { type: String, required: true },
  format: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }
});

// 用于渲染进程的类型
export interface RendererProcessBookFile extends IBookFileBase {
  _id: string;
  book: string;
};

export const BookFile = mongoose.model<IBookFile>('BookFile', BookFileSchema);