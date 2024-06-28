import fs from 'fs-extra';
import path from 'path';
import s3Client from '../data/minio/MinioClient';
import { BUCKET_NAME } from '../constants';
import { toObjectId } from '../utils/DtoUtils';

class LocalBookCacheServcies {
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.join(require('os').homedir(), '.raybook', 'books');
    fs.ensureDirSync(this.cacheDir);
  }

  async getBookFile(bookId: Id, filePath: string): Promise<string> {
    const idString = toObjectId(bookId).toHexString();
    const localPath = this.getLocalPath(idString, filePath);

    if (await this.isFileCached(localPath)) {
      console.log('Book file found in cache');
      return localPath;
    }

    console.log('Book file not in cache, downloading from MinIO');
    return this.downloadAndCacheFile(idString, filePath, localPath);
  }

  private getLocalPath(bookId: string, filePath: string): string {
    return path.join(this.cacheDir, bookId, path.basename(filePath));
  }

  private async isFileCached(localPath: string): Promise<boolean> {
    return fs.pathExists(localPath);
  }

/**
 * Downloads a file from an S3 bucket and caches it locally.
 * 
 * @param bookId - The ID of the book.
 * @param filePath - The path of the file in the S3 bucket.
 * @param localPath - The local path where the file will be cached.
 * @returns The local path of the cached file.
 */
  private async downloadAndCacheFile(bookId: string, filePath: string, localPath: string): Promise<string> {
    const data = await s3Client.getObject({
      Bucket: BUCKET_NAME,
      Key: filePath
    }).promise();

    await fs.ensureDir(path.dirname(localPath));
    await fs.writeFile(localPath, data.Body as Buffer);

    return localPath;
  }

/**
 * Clears the cache for a specific book or all books.
 * If a `bookId` is provided, the cache for that specific book will be cleared.
 * If no `bookId` is provided, the cache for all books will be cleared.
 * @param bookId - The ID of the book to clear the cache for. If not provided, the cache for all books will be cleared.
 * @returns A Promise that resolves when the cache is cleared.
 */
  async clearCache(bookId?: string): Promise<void> {
    if (bookId) {
      await fs.remove(path.join(this.cacheDir, bookId));
    } else {
      await fs.emptyDir(this.cacheDir);
    }
  }
}

export const localBookCache = new LocalBookCacheServcies();