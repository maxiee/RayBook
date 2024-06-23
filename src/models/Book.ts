import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
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
    data: Buffer,
    contentType: string
  };
  files: Schema.Types.ObjectId[];
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

export default mongoose.model<IBook>('Book', BookSchema);