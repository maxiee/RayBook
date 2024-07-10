import { app, BrowserWindow, ipcMain, session } from "electron";
import mongoose from "mongoose";
import { minioEndpoint } from "./data/minio/MinioClient";
import { epubService } from "./services/epub/EpubServiceImpl";
import { registerIpcHandlers } from "./core/ipc/IpcWrapper";
import { bookFileService } from "./services/bookfile/BookFileServiceImpl";
import { bookService } from "./services/book/BookServiceImpl";
import { bookCoverService } from "./services/bookcover/BookCoverServiceImpl";
import { fileService } from "./services/file/FileServiceImpl";
import isDev from "electron-is-dev";
import { logService } from "./services/log/LogServiceImpl";
import Store from 'electron-store';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

Store.initRenderer();

const createWindow = (): void => {
  logService.info("Application started");
  logService.info("Maxiee 是否是测试环境", isDev);
  logService.info(MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY)
  logService.info(MAIN_WINDOW_WEBPACK_ENTRY)
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
    if (process.env.NODE_ENV === "development") {
      // 开发环境的 CSP
      csp = [
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: file:;",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
        `img-src 'self' data: ${minioEndpoint} blob: file:;`,
        "style-src 'self' 'unsafe-inline' blob:;",
        "font-src 'self' data: file:;",
        `connect-src 'self' ws: ${minioEndpoint} http://localhost:* http://0.0.0.0:* file: blob:;`,
      ].join(" ");
    } else {
      // 生产环境的 CSP
      csp = [
        "default-src 'self' 'unsafe-inline' data: blob: file:;",
        `img-src 'self' data: ${minioEndpoint} file:;`,
        "style-src 'self' 'unsafe-inline' blob:;",
        "font-src 'self' data: file:;",
        `connect-src 'self' ${minioEndpoint} file: blob:;`,
      ].join(" ");
    }

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": csp,
      },
    });
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.on("will-navigate", (event, url) => {
    event.preventDefault();
    mainWindow.loadURL(url);
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  logService.info("Application exited");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  logService.info("Application activated");
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

// 注册 IPC 处理程序
registerIpcHandlers(bookService);
registerIpcHandlers(bookFileService);
registerIpcHandlers(bookCoverService);
registerIpcHandlers(fileService);
registerIpcHandlers(epubService);
registerIpcHandlers(logService);

ipcMain.on('config-updated', () => {
  app.relaunch();
  app.exit(0);
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
