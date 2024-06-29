import EPub from "epub2";
import s3Client from "../data/minio/MinioClient";
import path from "path";
import { toObjectId } from "../utils/DtoUtils";
import Book from "../models/Book";
import fs from "fs";
import { BUCKET_NAME } from "../constants";

export class CoverIamgeRepostory {
    static collectionPath: string = 'book-cover-images';

    /**
     * Constructs the cover image filename for a book.
     * @param bookId - The ID of the book.
     * @param originalFilename - The original filename of the cover image.
     * @returns The constructed cover image filename.
     */
    static constructCoverImageFilename(bookIdString: string, originalFilename: string): string {
        const originalExtension = path.extname(originalFilename);
        return `${CoverIamgeRepostory.collectionPath}/${bookIdString}${originalExtension}`;
    }

    async findCoverImageByPath(path: string) {
        try {
            // 获取 MinIO 中文件的 URL
            const coverUrl = await s3Client.getSignedUrlPromise('getObject', {
                Bucket: 'raybook',
                Key: path,
                Expires: 60 * 60 * 24 * 7 // URL 有效期为 7 天
            });
            return {
                success: true,
                message: '成功提取封面',
                coverUrl: coverUrl
            };
            
        } catch (error) {
            console.error('Error fetching cover image:', error);
            return { success: false, message: '获取封面失败' };
        }
    }


    /**
     * Uploads a book cover image to the specified book ID.
     * @param {string} bookId - The ID of the book.
     * @param {string} filepath - The file path of the cover image.
     * @returns {Promise<boolean>} - 上传到 MinIO 的封面的 URL。
     */
    async uploadBookCoverImage(bookId: Id, filepath: string) {
        const epub: EPub = await EPub.createAsync(filepath);
        const coverPath = epub.metadata.cover;

        if (!coverPath) return { success: false, message: '未找到封面' };

        const coverData: { data: Buffer, mimeType: string; } = await new Promise((resolve, reject) => {
            epub.getImage(coverPath, (err: Error, data: Buffer, mimeType: string) => {
                if (err) reject(err);
                else resolve({ data, mimeType });
            });
        });

        const coverObjectName = CoverIamgeRepostory.constructCoverImageFilename(
            toObjectId(bookId).toHexString(),
            coverPath);

        
        await s3Client.putObject({
            Bucket: BUCKET_NAME,
            Key: coverObjectName,
            Body: coverData.data,
            ContentType: coverData.mimeType
        }).promise();

        // 更新书籍的封面路径
        // TODO 未来 BookRepository 变成单例后，通过单例方法更新封面路径
        await Book.findByIdAndUpdate(
            toObjectId(bookId), 
            { coverImagePath: coverObjectName });

        // 获取 MinIO 中文件的 URL
        const coverUrl = await s3Client.getSignedUrlPromise('getObject', {
            Bucket: 'raybook',
            Key: coverObjectName,
            Expires: 60 * 60 * 24 * 7 // URL 有效期为 7 天
        });

        return { 
            success: true, 
            message: '成功提取封面',
            coverUrl: coverUrl
        };
    }
}