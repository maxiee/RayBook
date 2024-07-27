import React, { useEffect, useRef, useState } from "react";
import { Avatar, Button, Layout, Typography, message } from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { debounce } from "ts-debounce";
import { bookServiceRender, logServiceRender } from "../../../app";
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
  const [isBookInRayBook, setIsBookInRayBook] = useState<boolean>(false);
  const [bookKey, setBookKey] = useState<string | null>(null);

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

    const checkBookInRayBook = async (bookKey: string) => {
      const result = await bookServiceRender.findBookByWeixinBookKey(bookKey);
      setIsBookInRayBook(result.success && result.payload !== null);
    };

    // 监听新书打开的消息
    const handleBookOpened = async (event: any, bookKey: string) => {
      logServiceRender.info(`New book opened with key: ${bookKey}`);
      await checkBookInRayBook(bookKey);
      setBookKey(bookKey);

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

  const handleCreateBook = async () => {
    if (bookData && bookData.bookmarklist && bookData.bookmarklist.book) {
      const result = await bookServiceRender.createBookFromWeixin(
        bookKey,
        bookData.bookmarklist.book
      );
      if (result.success) {
        message.success("成功创建图书");
        setIsBookInRayBook(true);
      } else {
        message.error("创建图书失败");
      }
    }
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
        {!isBookInRayBook && (
          <Button icon={<PlusOutlined />} onClick={handleCreateBook}>
            添加到 RayBook
          </Button>
        )}
      </Header>
      <Content ref={contentRef} style={{ flex: 1 }} />
    </Layout>
  );
};

export default WeixinReadPage;
