import React, { useState } from "react";
import { Button, message, Progress, Table, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { bookFileServiceRender } from "../../../app";

const { Title } = Typography;

const Sha256CompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<
    Array<{ fileName: string; status: string }>
  >([]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSha256Completion = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const filesResponse =
        await bookFileServiceRender.getBookFilesWithoutSha256();
      if (!filesResponse.success) {
        throw new Error(filesResponse.message);
      }

      const files = filesResponse.payload;
      const totalFiles = files.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const result = await bookFileServiceRender.calculateAndUpdateSha256(
          file.book,
          file._id
        );

        setResults((prevResults) => [...prevResults, result.payload]);
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      message.success("SHA256 补齐完成");
    } catch (error) {
      console.error("Error during SHA256 completion:", error);
      message.error("处理过程中发生错误");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    {
      title: "书名",
      dataIndex: "bookTitle",
      key: "bookTitle",
    },
    {
      title: "文件名",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span style={{ color: status === "success" ? "green" : "red" }}>
          {status === "success" ? "成功" : "失败"}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        style={{ marginBottom: "20px" }}
      >
        返回
      </Button>
      <Title level={2}>SHA256 补齐</Title>
      <Button
        onClick={handleSha256Completion}
        disabled={isProcessing}
        type="primary"
        style={{ marginBottom: "20px" }}
      >
        {isProcessing ? "处理中..." : "开始处理"}
      </Button>
      {isProcessing && (
        <Progress percent={progress} style={{ marginBottom: "20px" }} />
      )}
      <Table
        dataSource={results}
        columns={columns}
        rowKey={(record) => `${record.fileName}`}
      />
    </div>
  );
};

export default Sha256CompletionPage;
