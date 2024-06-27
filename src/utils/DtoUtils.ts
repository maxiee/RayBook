import { Types } from 'mongoose';

export const toObjectId = (binaryId: Id): Types.ObjectId => {
  // 将 Uint8Array 转换为十六进制字符串
  return new Types.ObjectId(binaryId.buffer);
  // return new Types.ObjectId(
  //   Array.from(binaryId.buffer)
  //     .map(b => b.toString(16).padStart(2, '0')).join(''));
}