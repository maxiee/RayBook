import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  _id: Id;
  title: string;
  subtitle?: string;
  series?: string;
  author?: string;
  translator?: string;
  originalTitle?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  lastReadTime?: Date;
  coverImagePath?: string;
  weixinBookKey?: string;
  weixinBookId?: string;
  weixinBookTitle?: string;
  weixinBookAuthor?: string;
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
  lastReadTime: { type: Date },
  coverImagePath: { type: String, required: false },
  weixinBookKey: { type: String },
  weixinBookId: { type: String },
  weixinBookTitle: { type: String },
  weixinBookAuthor: { type: String },
});

export default mongoose.model<IBook>("Book", BookSchema);
