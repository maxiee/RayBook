import mongoose, { Schema, Document } from 'mongoose';

export interface IBookFile extends Document {
  _id: Schema.Types.ObjectId | string;
  filename: string;
  format: string;
  path: string;
  size: number;
  book: Schema.Types.ObjectId | string;
}

const BookFileSchema: Schema = new Schema({
  filename: { type: String, required: true },
  format: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }
});

export const BookFile = mongoose.model<IBookFile>('BookFile', BookFileSchema);