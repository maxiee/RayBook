import fs from "fs";
import path from "path";
import { BookFile, IBookFile } from "../models/BookFile";
import s3Client from "../data/minio/MinioClient";
import { toObjectId } from "../utils/DtoUtils";
import { BUCKET_NAME } from "../constants";

class BookFileRepostory {
  /**
   * Uploads a book file to the server and saves its metadata in the database.
   * @param bookId - The ID of the book associated with the file.
   * @param filePath - The path to the file on the local filesystem.
   * @param filename - The name of the file.
   * @param objectName - The name of the object to be stored in the server.
   * @returns A Promise that resolves to the newly created book file object, or null if the file already exists.
   */
  async uploadBookFile(
    bookId: Id,
    filePath: string,
    filename: string,
    objectName: string
  ): Promise<IBookFile | null> {
    const fileStats = fs.statSync(filePath);
    const fileExtension = path.extname(filePath).slice(1);

    const existingBookFile = await this.findBookFileByObjectName(objectName);
    if (existingBookFile) {
      console.log("File already exists");
      return null;
    }

    const newBookFile = new BookFile({
      filename: filename,
      format: fileExtension,
      path: objectName,
      size: fileStats.size,
      book: toObjectId(bookId),
    });
    await newBookFile.save();

    await s3Client
      .upload({
        Bucket: BUCKET_NAME,
        Key: objectName,
        Body: fs.createReadStream(filePath),
      })
      .promise();

    return newBookFile.toObject();
  }

  async findBookFileById(bookFileId: Id): Promise<IBookFile | null> {
    return await BookFile.findById(toObjectId(bookFileId)).lean();
  }

  async findBookFileByObjectName(
    objectName: string
  ): Promise<IBookFile | null> {
    return await BookFile.findOne({ objectName }).lean();
  }

  async findBookFilesByBookId(bookId: Id): Promise<IBookFile[]> {
    return await BookFile.find({ book: toObjectId(bookId) }).lean();
  }

  //   async removeBookFile(bookId: string, fileId: string): Promise<boolean> {
  //     const result = await BookFile.findByIdAndDelete(fileId);
  //     if (result) {
  //       await Book.findByIdAndUpdate(bookId, {
  //         $pull: { files: new SchemaTypes.ObjectId(fileId) },
  //       });
  //       return true;
  //     }
  //     return false;
  //   }
}

export const bookFileRepository = new BookFileRepostory();
