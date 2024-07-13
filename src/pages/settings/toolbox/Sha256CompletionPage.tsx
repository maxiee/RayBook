import React, { useState } from "react";
import { Button, message, Progress, Table } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { bookFileServiceRender } from "../../../app";

const Sha256CompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSha256Completion = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const response = await bookFileServiceRender.completeSha256ForAllBooks();
      if (response.success) {
        message.success("SHA256 补齐完成");
        setResults(response.payload);
      } else {
        message.error("SHA256 补齐失败");
      }
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
      <h1>SHA256 补齐</h1>
      <Button onClick={handleSha256Completion} disabled={isProcessing}>
        开始处理
      </Button>
      {isProcessing && <Progress percent={progress} />}
      <Table
        dataSource={results}
        columns={columns}
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};

export default Sha256CompletionPage;
