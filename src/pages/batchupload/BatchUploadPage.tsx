import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Progress, Table, Typography, Card, message, Button } from "antd";
import {
  bookCoverServiceRender,
  bookFileServiceRender,
  bookServiceRender,
  epubServiceRender,
  logServiceRender,
} from "../../app";
import { BookWithFiles } from "../../services/book/BookServiceInterface";
import { IMetadata } from "epub2/lib/epub/const";

const { Title, Text } = Typography;

const BatchUploadPage: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [totalFiles, setTotalFiles] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [progress, setProgress] = useState(0);
  const [bookWithFileList, setBookWithFileList] = useState<BookWithFiles[]>([]);
  const [bookModelSaveStatus, setBookModelSaveStatus] = useState<{
    [key: string]: "pending" | "success" | "error";
  }>({});
  const [bookFileUploadStatus, setBookFileUploadStatus] = useState<{
    [key: string]: { [key: string]: "pending" | "success" | "error" };
  }>({});

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const selectedDir = searchParams.get("dir");
    if (selectedDir) {
      logServiceRender.info("Selected directory:", selectedDir);
      loadBooks(selectedDir);
    }
  }, [location]);

  const loadBooks = async (directory: string) => {
    logServiceRender.info("Loading books from directory:", directory);
    // 已将 epub 类型文件放在 files 的第一位
    const bookBatchResult = await bookServiceRender.batchParseBooksInDirectory(
      directory
    );
    const bookBatch = bookBatchResult.payload;

    if (!bookBatch) {
      logServiceRender.error("Failed to batch parse books");
      message.error("批量解析书籍失败");
      return;
    }

    setTotalFiles(bookBatch.reduce((acc, book) => acc + book.files.length, 0));
    setTotalBooks(bookBatch.length);
    setBookWithFileList(bookBatch);
  };

  const startBatchUpload = async () => {
    try {
      setProgress(0);
      const books = bookWithFileList;

      for (let i = 0; i < books.length; i++) {
        const bookName = books[i].name;
        setBookModelSaveStatus((prevStatus) => ({
          ...prevStatus,
          [bookName]: "pending",
        }));

        // 提取元数据
        // 如果 files 中有 epub，则从 epub 中提取元数据
        // 如果 files 中没有 epub，则创建只有书名的空元数据
        let bookMetadata = {
          title: bookName,
          author: "",
          publisher: "",
          isbn: "",
          publicationYear: 0,
        };

        const epubFile = books[i].files.find(
          (file) => file.fileExtension === ".epub"
        );
        // 提取 epub 元数据
        if (epubFile) {
          logServiceRender.info("Extracting metadata from epub:", epubFile);
          const epubMetadata = await epubServiceRender.extractMetadata(
            epubFile.fullPath
          );
          logServiceRender.info("Epub metadata:", epubMetadata);
          const metadataPayload: IMetadata = epubMetadata.payload;
          if (epubMetadata.success) {
            bookMetadata = {
              title: metadataPayload.title || bookName,
              author: metadataPayload.creator || "",
              publisher: metadataPayload.publisher || "",
              isbn: metadataPayload.ISBN || "",
              publicationYear: metadataPayload.date
                ? new Date(metadataPayload.date).getFullYear()
                : 0,
            };
          }
        }
        logServiceRender.info("Book metadata:", bookMetadata);
        const bookModelSaveResult = await bookServiceRender.addBookByModel(
          bookMetadata
        );

        if (!bookModelSaveResult.payload) {
          logServiceRender.error(
            "Failed to save book model:",
            bookModelSaveResult.message
          );
          setBookModelSaveStatus((prevStatus) => ({
            ...prevStatus,
            [bookName]: "error",
          }));
          continue;
        }

        // 提取 Epub 封面
        if (epubFile) {
          const coverImageResult =
            await bookCoverServiceRender.extractLocalBookCover(
              bookModelSaveResult.payload._id,
              epubFile.fullPath
            );
          if (!coverImageResult.success) {
            logServiceRender.error(
              "Failed to extract cover image:",
              coverImageResult.message
            );
          }
        }

        const bookId = bookModelSaveResult.payload._id;
        setBookModelSaveStatus((prevStatus) => ({
          ...prevStatus,
          [bookName]: "success",
        }));

        setBookFileUploadStatus((prevStatus) => ({
          ...prevStatus,
          [bookName]: {},
        }));

        for (let j = 0; j < bookWithFileList[i].files.length; j++) {
          const fileName = bookWithFileList[i].files[j].filename;
          setBookFileUploadStatus((prevStatus) => ({
            ...prevStatus,
            [bookName]: { ...prevStatus[bookName], [fileName]: "pending" },
          }));

          const fileUploadResult =
            await bookFileServiceRender.uploadBookFileByPath(
              bookId,
              bookWithFileList[i].files[j].fullPath
            );
          if (!fileUploadResult.success) {
            logServiceRender.error(
              `Failed to upload file ${fileName} for book ${bookName}:`,
              fileUploadResult.message
            );
            setBookFileUploadStatus((prevStatus) => ({
              ...prevStatus,
              [bookName]: { ...prevStatus[bookName], [fileName]: "error" },
            }));
          } else {
            setBookFileUploadStatus((prevStatus) => ({
              ...prevStatus,
              [bookName]: { ...prevStatus[bookName], [fileName]: "success" },
            }));
          }
        }

        setProgress((prevProgress) =>
          Math.round(((i + 1) / books.length) * 100)
        );
      }
      message.success("批量上传书籍成功");
    } catch (error) {
      logServiceRender.error("Failed to batch upload books:", error);
      message.error("批量上传书籍失败");
    }
  };

  const handleStartUpload = async () => {
    setIsUploading(true);
    try {
      await startBatchUpload();
      message.success("批量上传完成");
      setIsUploadComplete(true);
    } catch (error) {
      logServiceRender.error("批量上传失败:", error);
      message.error("批量上传失败");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  const columns = [
    {
      title: "书名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "文件",
      dataIndex: "files",
      key: "files",
      render: (files: { filename: string; fileExtension: string }[]) => {
        return files.map((file) => file.filename).join(", ");
      },
    },
    {
      title: "BookModel状态",
      key: "status",
      render: (record: BookWithFiles) => {
        const bookName = record.name;
        if (bookModelSaveStatus[bookName] === "success") {
          return "已添加";
        } else if (bookModelSaveStatus[bookName] === "error") {
          return "添加失败";
        } else {
          return "待添加";
        }
      },
    },
    {
      title: "文件上传状态",
      key: "fileStatus",
      render: (record: BookWithFiles) => {
        const bookName = record.name;
        const fileStatus = bookFileUploadStatus[bookName];
        if (!fileStatus) {
          return "待上传";
        }

        const pendingFiles = Object.values(fileStatus).filter(
          (status) => status === "pending"
        ).length;
        const successFiles = Object.values(fileStatus).filter(
          (status) => status === "success"
        ).length;
        const errorFiles = Object.values(fileStatus).filter(
          (status) => status === "error"
        ).length;

        return `${successFiles} 成功, ${errorFiles} 失败, ${pendingFiles} 待上传`;
      },
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>批量添加书籍</Title>
      <Progress percent={progress} status="active" />
      <Card style={{ marginTop: "20px" }}>
        <Title level={4}>整体情况</Title>
        <Text>扫描到的文件总数：{totalFiles}</Text>
        <br />
        <Text>合并后的书籍总数：{totalBooks}</Text>
      </Card>
      <Table
        style={{ marginTop: "20px" }}
        columns={columns}
        dataSource={bookWithFileList}
        rowKey="name"
      />
      {!isUploadComplete && (
        <Button
          type="primary"
          size="large"
          onClick={handleStartUpload}
          disabled={isUploading || bookWithFileList.length === 0}
          loading={isUploading}
          style={{ marginTop: "20px" }}
        >
          {isUploading ? "正在上传..." : "开始上传"}
        </Button>
      )}
      {isUploadComplete && (
        <Button
          type="primary"
          size="large"
          onClick={handleReturnHome}
          style={{ marginTop: "20px" }}
        >
          返回首页
        </Button>
      )}
    </div>
  );
};

export default BatchUploadPage;
