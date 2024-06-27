import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  _id: Schema.Types.ObjectId | string;
  title: string;
  subtitle?: string;
  series?: string;
  author?: string;
  translator?: string;
  originalTitle?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  coverImagePath?: string;
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
  coverImagePath: String,
});

export default mongoose.model<IBook>('Book', BookSchema);