import fs from 'fs';
import path from 'path';
import { BookFile, IBookFile } from '../models/BookFile';
import { SchemaTypes } from 'mongoose';
import s3Client from '../data/minio/MinioClient';
import { toObjectId } from '../utils/DtoUtils';
import {BUCKET_NAME} from '../constants';

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

    async findBookFileById(bookFileId: Id): Promise<IBookFile | null> {
        return await BookFile.findById(toObjectId(bookFileId)).lean();
    }

    async findBookFileByObjectName(objectName: string): Promise<IBookFile | null> {
        return await BookFile.findOne({ objectName }).lean();
    }

    async findBookFilesByBookId(bookId: Id): Promise<IBookFile[]> {
        return await BookFile.find({ book: toObjectId(bookId) }).lean();
    }
}