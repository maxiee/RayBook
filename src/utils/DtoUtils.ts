import { Types } from 'mongoose';

export const toObjectId = (binaryId: Id): Types.ObjectId => {
  // 将 Uint8Array 转换为十六进制字符串
  return new Types.ObjectId(binaryId.buffer);
  // return new Types.ObjectId(
  //   Array.from(binaryId.buffer)
  //     .map(b => b.toString(16).padStart(2, '0')).join(''));
}

export function serializeId(id: Id): string {
  return Buffer.from(id.buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function deserializeId(serialized: string): Id {
  const base64 = serialized
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(serialized.length + (4 - serialized.length % 4) % 4, '=');
  
  const buffer = Buffer.from(base64, 'base64');
  return { buffer: new Uint8Array(buffer) };
}