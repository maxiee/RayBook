import { Types } from 'mongoose';

export interface IBook {
  _id: string;
  title: string;
  subtitle?: string;
  series?: string;
  author?: string;
  translator?: string;
  originalTitle?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  coverImage?: {
    data: string; // 在渲染进程中，我们使用 Base64 字符串
    contentType: string;
  };
  files: IBookFile[];
}

export interface IBookFile {
  _id: string;
  filename: string;
  format: string;
  size: number;
  path: string;
}