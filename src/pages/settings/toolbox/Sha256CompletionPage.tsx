import React, { useState, useEffect } from "react";
import { Button, message, Progress, Table, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { bookFileServiceRender, logServiceRender } from "../../../app";
import { IBookFile } from "../../../models/BookFile";
import { toObjectId } from "../../../utils/DtoUtils";

const { Title } = Typography;

const Sha256CompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<IBookFile[]>([]);
  const [filesToProcess, setFilesToProcess] = useState<IBookFile[]>([]);

  useEffect(() => {
    fetchFilesWithoutSha256();
  }, []);

  const fetchFilesWithoutSha256 = async () => {
    try {
      const response = await bookFileServiceRender.getBookFilesWithoutSha256();
      if (response.success) {
        setFilesToProcess(response.payload);
      } else {
        message.error("获取需要处理的文件失败");
      }
    } catch (error) {
      logServiceRender.error("获取需要处理的文件时出错:", error);
      message.error("获取需要处理的文件时出错");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSha256Completion = async () => {
    logServiceRender.info("开始补齐 SHA256");
    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    try {
      const totalFiles = filesToProcess.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = filesToProcess[i];
        logServiceRender.info(`处理文件 ${file.filename}`);
        const result = await bookFileServiceRender.calculateAndUpdateSha256(
          file.book,
          file._id
        );

        if (!result.success) {
          logServiceRender.error(
            `处理文件 ${file.filename} 时出错:`,
            result.message
          );
        }

        setResults((prevResults) => [...prevResults, result.payload]);
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      message.success("SHA256 补齐完成");
      fetchFilesWithoutSha256(); // 重新获取需要处理的文件列表
    } catch (error) {
      logServiceRender.error("SHA256 补齐过程中发生错误:", error);
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
      dataIndex: "filename",
      key: "filename",
    },
    {
      title: "sha256",
      dataIndex: "sha256",
      key: "sha256",
    },
    {
      title: "状态",
      dataIndex: "sha256",
      key: "status",
      render: (sha256: string) => (
        <span style={{ color: sha256 ? "green" : "red" }}>
          {sha256 ? "已补齐" : "未补齐"}
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
        disabled={isProcessing || filesToProcess.length === 0}
        type="primary"
        style={{ marginBottom: "20px" }}
      >
        {isProcessing
          ? "处理中..."
          : `开始处理 (${filesToProcess.length} 个文件)`}
      </Button>
      {isProcessing && (
        <Progress percent={progress} style={{ marginBottom: "20px" }} />
      )}
      <Table
        dataSource={filesToProcess}
        columns={columns}
        rowKey={(record) => toObjectId(record._id).toHexString()}
      />
    </div>
  );
};

export default Sha256CompletionPage;
