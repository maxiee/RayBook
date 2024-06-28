import { app, BrowserWindow, ipcMain, dialog, session } from 'electron';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { IBook } from './models/Book';
import { IBookFile } from './models/BookFile';
import { BookRepository } from './repository/BookRepository';
import { BookFileRepostory } from './repository/BookfileRepository';
import s3Client, { minioEndpoint } from './data/minio/MinioClient';
import { CoverIamgeRepostory } from './repository/CoverImageRepostory';
import { localBookCache } from './services/LocalBookCacheService';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // 警告：这会禁用所有的 web 安全性检查
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // 设置 CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let csp;
    if (process.env.NODE_ENV === 'development') {
      // 开发环境的 CSP
      csp = [
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        `img-src 'self' data: ${minioEndpoint} file:;` +
        `connect-src 'self' ws: ${minioEndpoint} http://localhost:* http://0.0.0.0:* file:;`
      ];
    } else {
      // 生产环境的 CSP
      csp = [
        "default-src 'self' 'unsafe-inline' data:; " +
        `img-src 'self' data: ${minioEndpoint} file:; ` +
        `connect-src 'self' ${minioEndpoint} file:;`
      ];
    }

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': csp
      }
    });
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    mainWindow.loadURL(url)
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 连接到 MongoDB, ENV RAYBOOK_MONGO_URI
mongoose.connect(process.env.RAYBOOK_MONGO_URI);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const bookRepository = new BookRepository();
const bookfileRepository = new BookFileRepostory();
const coverImageRepository = new CoverIamgeRepostory();

// 获取书籍详情
ipcMain.handle('get-book-details', async (event, bookId: Id): Promise<IBook | null> => {
  try {
    return await bookRepository.findBookById(bookId);
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
});

// 更新书籍信息
ipcMain.handle('update-book', async (event, book: IBook | null) => {
  try {
    return await bookRepository.updateBook(book);
  } catch (error) {
    console.error('更新图书时出错:', error);
    return null;
  }
});

// 上传图书文件
ipcMain.handle('upload-book-file', async (event, bookId: string): Promise<IBookFile | null> => {
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
    const newUploadBookFile = await bookfileRepository.uploadBookFile(bookId, filePath, objectName);

    if (!newUploadBookFile) {
      return null;
    }

    return newUploadBookFile;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
});

// 处理图书添加
ipcMain.handle('add-book', async (event, book: IBook): Promise<IBook | null> => {
  try {
    const newBook = await bookRepository.createNewBook(book);
    // 保存到数据库
    await newBook.save();
    return newBook;
  } catch (error) {
    console.error('添加图书时出错:', error);
    return null;
  }
});

// 添加新的 IPC 接口用于分页加载最新添加的书籍
ipcMain.handle('get-latest-books', async (event, page = 1, pageSize = 10) => {
  try {
    // 查询书籍
    const { books, total } = await bookRepository.findAll(page, pageSize);

    return {
      success: true,
      data: books,
      total,
      currentPage: page,
      pageSize,
    };
  } catch (error) {
    console.error('Error fetching latest books:', error);
    return { success: false, message: '获取最新书籍失败' };
  }
});

ipcMain.handle('get-book-cover', async (event, coverIamgePath: string) => {
  try {
    const coverImage = await coverImageRepository.findCoverImageByPath(coverIamgePath);
    return coverImage;
  } catch (error) {
    console.error('Error fetching cover image:', error);
    return null;
  }

});

ipcMain.handle('get-book-files', async (event, bookId: Id) => {
  try {
    return await bookfileRepository.findBookFilesByBookId(bookId);
  } catch (error) {
    console.error('Error fetching book files:', error);
    return [];
  }
});

ipcMain.handle('extract-cover', async (event, bookId: Id, fileId: Id) => {
  try {
    const bookFile = await bookfileRepository.findBookFileById(fileId);
    if (!bookFile) {
      return { success: false, message: '文件不存在' };
    }

    // 使用本地缓存模块获取文件
    const filePath = await localBookCache.getBookFile(bookId, bookFile.path);

    return await coverImageRepository.uploadBookCoverImage(bookId, filePath);
  } catch (error) {
    console.error('提取封面时出错:', error);
    return { success: false, message: '提取封面失败' };
  }
});

ipcMain.handle('get-local-book-path', async (event, bookId: Id) => {
  try {
    const bookFiles = await bookfileRepository.findBookFilesByBookId(bookId);
   
    const localPath = await localBookCache.getBookFile(bookId, bookFiles[0].path);
    
    return { success: true, path: localPath };
  } catch (error) {
    console.error('Error getting local book path:', error);
    return { success: false, message: 'Failed to get local book path' };
  }
});

// // 删除书籍文件
// ipcMain.handle('delete-book-file', async (event, fileId) => {
//   try {
//     const bookFile = await BookFile.findById(fileId);
//     if (!bookFile) {
//       return { success: false, message: '文件不存在' };
//     }

//     // 从 MinIO 删除文件
//     await s3Client.deleteObject({
//       Bucket: 'raybook',
//       Key: bookFile.path
//     }).promise();

//     // 从数据库中删除文件记录
//     await BookFile.findByIdAndDelete(fileId);

//     // 更新相关的 Book 文档
//     await Book.findByIdAndUpdate(bookFile.book, { $pull: { files: fileId } });

//     return { success: true, message: '文件删除成功' };
//   } catch (error) {
//     console.error('删除文件时出错:', error);
//     return { success: false, message: '删除文件失败' };
//   }
// });