import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { configStore } from "../../config/ConfigStore";
const { ipcRenderer } = window.require("electron");

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    const config = configStore.getConfig();
    form.setFieldsValue(config);
  }, []);

  const onFinish = (values: any) => {
    configStore.setConfig(values);
    message.success("Settings saved successfully");
    ipcRenderer.send("config-updated");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>RayBook Settings</h1>
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
