import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Row, Col } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { configStore } from "../../config/ConfigStore";
import { useLocation, useNavigate } from "react-router-dom";
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
    if (isBlockingPage) {
      // 如果是阻塞页面，保存设置后刷新整个应用
      window.location.reload();
    }
  };

  const handleBack = () => {
    navigate("/");
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
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SettingsPage;
