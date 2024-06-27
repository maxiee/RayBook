import EPub from "epub2";
import s3Client from "../data/minio/MinioClient";
import path from "path";

export class CoverIamgeRepostory {
    static collectionPath: string = 'book-cover-images';

    /**
     * Constructs the cover image filename for a book.
     * @param bookId - The ID of the book.
     * @param originalFilename - The original filename of the cover image.
     * @returns The constructed cover image filename.
     */
    static constructCoverImageFilename(bookId: string, originalFilename: string): string {
        const originalExtension = path.extname(originalFilename);
        return `${CoverIamgeRepostory.collectionPath}/${bookId}${originalExtension}`;
    }

    async findCoverImageByPath(path: string): Promise<Buffer | null> {
        try {
            const result = await s3Client.getObject({
                Bucket: BUCKET_NAME,
                Key: path
            }).promise();
            return result.Body as Buffer;
        } catch (error) {
            console.error('Error fetching cover image:', error);
            return null;
        }
    }


    /**
     * Uploads a book cover image to the specified book ID.
     * @param {string} bookId - The ID of the book.
     * @param {string} filepath - The file path of the cover image.
     * @returns {Promise<boolean>} - A promise that resolves to true if the upload is successful, false otherwise.
     */
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

            await s3Client.upload({
                Bucket: BUCKET_NAME,
                Key: CoverIamgeRepostory.constructCoverImageFilename(bookId, epub.metadata.cover),
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