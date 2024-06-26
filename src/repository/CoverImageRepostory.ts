import EPub from "epub2";
import s3Client from "../data/minio/MinioClient";
import path from "path";

export class CoverIamgeRepostory {
    static bucketName: string = 'book-cover-images';

    static constructCoverImageFilename(bookId: string, originalFilename: string): string {
        const originalExtension = path.extname(originalFilename);
        return `${bookId}${originalExtension}`;
    }

    async uploadBookCoverImage(bookId: string, filepath: string): Promise<boolean> {
        const epub: EPub = await EPub.createAsync(filepath);

        if (!epub.metadata.cover) return false;

        try {
            const coverData: { data: Buffer, mimeType: string; } = await new Promise((resolve, reject) => {
                epub.getImage(epub.metadata.cover, (err: Error, data: Buffer, mimeType: string) => {
                    if (err) reject(err);
                    else resolve({ data, mimeType });
                });
            });

            const newFilename = CoverIamgeRepostory.constructCoverImageFilename(bookId, epub.metadata.cover);

            await s3Client.upload({
                Bucket: CoverIamgeRepostory.bucketName,
                Key: newFilename,
                Body: coverData.data,
                ContentType: coverData.mimeType
            }).promise();

            return true;
        } catch (error) {
            console.error('Error extracting cover:', error);
            return false;
        }
    }
}