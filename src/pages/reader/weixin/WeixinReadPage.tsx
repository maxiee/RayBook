import React, { useEffect, useRef, useState } from "react";
import { Button, Layout } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { debounce } from "ts-debounce";
const { ipcRenderer } = window.require("electron");

const { Header, Content } = Layout;

const WeixinReadPage: React.FC = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentBounds, setContentBounds] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateBounds = () => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        setContentBounds({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    const resizeBounds = () => {
      updateBounds();
      ipcRenderer.send("weixin-read:resize", contentBounds);
    };

    updateBounds();
    window.addEventListener("resize", debounce(resizeBounds, 2000));

    // 初始化 BrowserView
    ipcRenderer.send("weixin-read:init", contentBounds);

    return () => {
      window.removeEventListener("resize", resizeBounds);
      ipcRenderer.send("weixin-read:cleanup");
    };
  }, []);

  useEffect(() => {
    // 当 contentBounds 变化时，更新 BrowserView 的大小
    ipcRenderer.send("weixin-read:resize", contentBounds);
  }, [contentBounds]);

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
