import fs from 'fs';
import path from 'path';
import { BookFile, IBookFile } from '../models/BookFile';
import { SchemaTypes } from 'mongoose';
import s3Client from '../data/minio/MinioClient';

export class BookFileRepostory {
    async uploadBookFile(bookId: string, filePath: string, objectName: string): Promise<IBookFile|null> {
        const fileStats = fs.statSync(filePath);
        const fileExtension = path.extname(filePath).slice(1);

        const existingBookFile = await this.findBookFileByObjectName(objectName);
        if (existingBookFile) {
            console.log('File already exists');
            return null;
        }
        
        const newBookFile = new BookFile({
            objectName,
            format: fileExtension,
            size: fileStats.size,
            book: new SchemaTypes.ObjectId(bookId)
        });
        await newBookFile.save();

        await s3Client.upload({
            Bucket: BUCKET_NAME,
            Key: objectName,
            Body: fs.createReadStream(filePath)
        }).promise();

        return newBookFile.toObject();
    }

    async findBookFileById(bookFileId: string): Promise<IBookFile | null> {
        return await BookFile.findById(bookFileId).lean();
    }

    async findBookFileByObjectName(objectName: string): Promise<IBookFile | null> {
        return await BookFile.findOne({ objectName }).lean();
    }

    async findBookFilesByBookId(bookId: string): Promise<IBookFile[]> {
        return await BookFile.find({ book: new SchemaTypes.ObjectId(bookId) }).lean();
    }
}