import { Document, Schema } from 'mongoose';
import { IBook } from '../models/Book';
import { IBookFile } from '../models/BookFile';

export class DtoUtils {
  static toTransferable<T extends { _id: Schema.Types.ObjectId | string }>(doc: T): T {
    const result: any = {};

    for (const [key, value] of Object.entries(doc)) {
      if (value instanceof Schema.Types.ObjectId) {
        result[key] = value.toString();
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => 
          item instanceof Schema.Types.ObjectId ? item.toString() : item
        );
      } else {
        result[key] = value;
      }
    }

    return result as T;
  }
}