import fs from 'fs';
import path from 'path';
import { IBookFile } from "../../models/BookFile";
import { IBookFileService } from "./BookFileServiceInterface";
import { bookFileRepository } from '../../repository/BookfileRepository';
import { dialog } from 'electron';
import { ApiResponse } from '../../core/ipc/ApiResponse';

class BookFileService implements IBookFileService {
    async uploadBookFile(bookId: Id): Promise<ApiResponse<IBookFile>> {
        try {
            const result = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [{ name: 'Book Files', extensions: ['epub', 'pdf', 'mobi'] }],
            });

            if (result.canceled || result.filePaths.length === 0) {
                return null;
            }

            const filePath = result.filePaths[0];
            const fileName = path.basename(filePath);
            const objectName = `books/${Date.now()}_${fileName}`;
            const newUploadBookFile = await bookFileRepository.uploadBookFile(
                bookId,
                filePath,
                fileName,
                objectName);

            if (!newUploadBookFile) {
                return null;
            }

            return {
                success: true,
                message: 'Book file uploaded successfully',
                payload: newUploadBookFile
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            return {
                success: false,
                message: 'Failed to upload book file',
                payload: null

            };
        }
    }

}

export const bookFileService = new BookFileService();