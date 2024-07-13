import mongoose, { Schema, Document } from "mongoose";

export interface IBookFile extends Document {
  _id: Id;
  filename: string;
  format: string;
  path: string;
  size: number;
  book: Id;
  sha256?: string; // 新增 sha256 属性
}

const BookFileSchema: Schema = new Schema({
  filename: { type: String, required: true },
  format: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  sha256: { type: String, required: false }, // 新增 sha256 字段
});

export const BookFile = mongoose.model<IBookFile>("BookFile", BookFileSchema);
