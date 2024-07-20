import React, { useEffect, useRef } from "react";
import { Button, Layout } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

const { Header, Content } = Layout;

const WeixinReadPage: React.FC = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rect = contentRef.current?.getBoundingClientRect();
    // 在这里初始化和控制BrowserView
    ipcRenderer.send("weixin-read:init", {
      x: rect?.x,
      y: rect?.y,
      width: rect?.width,
      height: rect?.height,
    });

    return () => {
      // 组件卸载时清理BrowserView
      ipcRenderer.send("weixin-read:cleanup");
    };
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header style={{ background: "#fff", padding: "0 16px" }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回
        </Button>
      </Header>
      <Content ref={contentRef} style={{ flex: 1 }} />
    </Layout>
  );
};

export default WeixinReadPage;
