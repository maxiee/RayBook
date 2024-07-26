import React, { useEffect, useRef, useState } from "react";
import { Avatar, Button, Layout, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { debounce } from "ts-debounce";
import { logServiceRender } from "../../../app";
const { ipcRenderer } = window.require("electron");

const { Header, Content } = Layout;
const { Text } = Typography;

interface BookmarkListData {
  synckey: number;
  updated: any[];
  removed: any[];
  chapters: any[];
  book: {
    bookId: string;
    title: string;
    author: string;
    cover: string;
  };
}

interface BookData {
  bookmarklist: BookmarkListData;
}

const WeixinReadPage: React.FC = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentBounds, setContentBounds] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [bookData, setBookData] = useState<BookData | null>(null);

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

    // 监听新书打开的消息
    const handleBookOpened = (event: any, bookKey: string) => {
      logServiceRender.info(`New book opened with key: ${bookKey}`);

      // 设置3秒定时器
      setTimeout(async () => {
        try {
          const data = await ipcRenderer.invoke("get-book-data", bookKey);
          logServiceRender.debug("Received book data:", data);
          setBookData(data);
        } catch (error) {
          logServiceRender.error("Error fetching book data:", error);
        }
      }, 3000);
    };

    ipcRenderer.on("weixin-read-book-opened", handleBookOpened);

    return () => {
      window.removeEventListener("resize", resizeBounds);
      ipcRenderer.send("weixin-read:cleanup");
      ipcRenderer.removeListener("weixin-read-book-opened", handleBookOpened);
    };
  }, []);

  // 首次渲染时，初始化 BrowserView 的大小
  useEffect(() => {
    // 当 contentBounds 变化时，更新 BrowserView 的大小
    ipcRenderer.send("weixin-read:resize", contentBounds);
  }, [contentBounds]);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回
        </Button>
        {bookData && bookData.bookmarklist && bookData.bookmarklist.book && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={bookData.bookmarklist.book.cover}
              size={40}
              style={{ marginRight: 8, flexShrink: 0 }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Text
                ellipsis
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                {bookData.bookmarklist.book.title}
              </Text>
              <Text
                ellipsis
                style={{
                  fontSize: "12px",
                  color: "#888",
                  lineHeight: "1.2",
                }}
              >
                {bookData.bookmarklist.book.author}
              </Text>
            </div>
          </div>
        )}
        <div style={{ width: 70 }} /> {/* 为了平衡布局 */}
      </Header>
      <Content ref={contentRef} style={{ flex: 1 }} />
    </Layout>
  );
};

export default WeixinReadPage;
