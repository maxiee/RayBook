import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Progress, Table, Typography, Card, message } from "antd";
import { bookServiceRender } from "../../app";

const { Title, Text } = Typography;

interface BatchUploadStatus {
  totalFiles: number;
  totalBooks: number;
  books: BookUploadStatus[];
}

interface BookUploadStatus {
  name: string;
  size: number;
  files: string[];
  bookStatus: "pending" | "processing" | "success" | "error";
  fileStatuses: ("pending" | "processing" | "success" | "error")[];
}

const BatchUploadPage: React.FC = () => {
  const [status, setStatus] = useState<BatchUploadStatus>({
    totalFiles: 0,
    totalBooks: 0,
    books: [],
  });
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const selectedDir = searchParams.get("dir");
    if (selectedDir) {
      startBatchUpload(selectedDir);
    }
  }, [location]);

  const startBatchUpload = async (directory: string) => {
    try {
      const bookNames: string[] = await bookServiceRender.getBooksInDirectory(
        directory
      );

      setStatus({
        totalFiles: 0, // 我们稍后会更新这个
        totalBooks: bookNames.length,
        books: bookNames.map((name) => ({
          name,
          size: 0,
          files: [],
          bookStatus: "pending",
          fileStatuses: [],
        })),
      });

      for (let i = 0; i < bookNames.length; i++) {
        const bookName = bookNames[i];
        setStatus((prevStatus) => ({
          ...prevStatus,
          books: prevStatus.books.map((book, index) =>
            index === i ? { ...book, bookStatus: "processing" } : book
          ),
        }));

        const bookStatus = await bookServiceRender.uploadBook(
          directory,
          bookName
        );

        setStatus((prevStatus) => {
          const newBooks = [...prevStatus.books];
          newBooks[i] = bookStatus;
          const newTotalFiles = newBooks.reduce(
            (sum, book) => sum + book.files.length,
            0
          );
          return {
            ...prevStatus,
            totalFiles: newTotalFiles,
            books: newBooks,
          };
        });

        setProgress((prevProgress) =>
          Math.round(((i + 1) / bookNames.length) * 100)
        );
      }

      message.success("批量上传完成");
    } catch (error) {
      console.error("批量上传过程中出错:", error);
      message.error("批量上传失败");
    }
  };

  const columns = [
    {
      title: "书名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "大小",
      dataIndex: "size",
      key: "size",
      render: (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: "文件",
      dataIndex: "files",
      key: "files",
      render: (files: string[]) => files.join(", "),
    },
    {
      title: "状态",
      key: "status",
      render: (_, record: BookUploadStatus) => (
        <>
          <Text>书籍: {record.bookStatus}</Text>
          <br />
          <Text>文件: {record.fileStatuses.join(", ")}</Text>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>批量添加书籍</Title>
      <Progress percent={progress} status="active" />
      <Card style={{ marginTop: "20px" }}>
        <Title level={4}>整体情况</Title>
        <Text>扫描到的文件总数：{status.totalFiles}</Text>
        <br />
        <Text>合并后的书籍总数：{status.totalBooks}</Text>
      </Card>
      <Table
        style={{ marginTop: "20px" }}
        columns={columns}
        dataSource={status.books}
        rowKey="name"
      />
    </div>
  );
};

export default BatchUploadPage;
