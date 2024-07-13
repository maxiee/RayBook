import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Row, Col, Card, Space } from "antd";
import {
  ArrowLeftOutlined,
  ToolOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { configStore } from "../../config/ConfigStore";
import { useLocation, useNavigate } from "react-router-dom";
import { fileServiceRender } from "../../app";
const { ipcRenderer } = window.require("electron");

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBlockingPage, setIsBlockingPage] = useState(false);

  useEffect(() => {
    const config = configStore.getConfig();
    form.setFieldsValue(config);
    setIsBlockingPage(!configStore.hasRequiredConfig());
  }, []);

  const onFinish = (values: any) => {
    configStore.setConfig(values);
    message.success("设置保存成功");
    ipcRenderer.send("config-updated");
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleSelectStoragePath = async () => {
    const result = await fileServiceRender.selectDirectory();
    if (result.success && result.payload) {
      form.setFieldsValue({ defaultStoragePath: result.payload });
    }
  };

  const handleSha256Complementation = () => {
    navigate("/sha256-complementation");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <h1>RayBook 设置</h1>
        </Col>
        {!isBlockingPage && (
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回
            </Button>
          </Col>
        )}
      </Row>{" "}
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="minioEndpoint"
          label="MinIO Endpoint"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="minioAccessKey"
          label="MinIO Access Key"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="minioSecretKey"
          label="MinIO Secret Key"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="mongoUri"
          label="MongoDB URI"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="defaultStoragePath"
          label="默认存储路径"
          rules={[{ required: true }]}
        >
          <Input
            readOnly
            addonAfter={
              <Button
                icon={<FolderOutlined />}
                onClick={handleSelectStoragePath}
              >
                选择
              </Button>
            }
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存设置
          </Button>
        </Form.Item>
      </Form>
      {!isBlockingPage && (
        <Card
          title={
            <>
              <ToolOutlined /> 工具箱
            </>
          }
          style={{ marginTop: 20 }}
        >
          <Space>
            <Button onClick={handleSha256Complementation}>SHA256 补齐</Button>
            {/* 这里可以添加更多工具箱按钮 */}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
