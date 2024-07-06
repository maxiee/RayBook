import React from "react";
import { Button, Table, message } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  FileImageOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import { IBookFile } from "../../../../models/BookFile";
import { bookFileServiceRender, logServiceRender } from "../../../../app";

interface BookFilesManagerProps {
  bookId: Id;
  bookFiles: IBookFile[];
  onFileUpload: () => void;
  onFileDelete: (fileId: Id) => void;
  onExtractCover: (fileId: Id) => Promise<void>;
  onFilesUpdate: () => void;
}

const BookFilesManager: React.FC<BookFilesManagerProps> = ({
  bookId,
  bookFiles,
  onFileUpload,
  onFileDelete,
  onExtractCover,
  onFilesUpdate,
}) => {
  const handleCalculateMd5 = async (fileId: Id) => {
    const result = await bookFileServiceRender.calculateAndUpdateMd5(
      bookId,
      fileId
    );
    if (result.success) {
      message.success(result.message);
      onFilesUpdate(); // 刷新文件列表
    } else {
      message.error(result.message);
    }
  };

  const columns = [
    { title: "文件名", dataIndex: "filename", key: "filename" },
    { title: "格式", dataIndex: "format", key: "format" },
    { title: "大小", dataIndex: "size", key: "size" },
    { title: "MD5", dataIndex: "md5", key: "md5" },
    {
      title: "操作",
      key: "action",
      render: (text: any, record: IBookFile) => (
        <>
          <Button
            icon={<FileImageOutlined />}
            onClick={() => onExtractCover(record._id)}
            style={{ marginRight: 8 }}
          >
            提取封面
          </Button>
          <Button
            icon={<CalculatorOutlined />}
            onClick={() => handleCalculateMd5(record._id)}
            style={{ marginRight: 8 }}
          >
            计算MD5
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => onFileDelete(record._id)}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  logServiceRender.info("bookFiles: ", bookFiles);

  return (
    <>
      <Button
        icon={<UploadOutlined />}
        onClick={onFileUpload}
        style={{ marginBottom: 16 }}
      >
        添加电子书文件
      </Button>
      <Table dataSource={bookFiles} columns={columns} rowKey="_id" />
    </>
  );
};

export default BookFilesManager;
