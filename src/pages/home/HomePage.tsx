import React, { useCallback, useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Button,
  Pagination,
  message,
  Tabs,
} from "antd";
import {
  BookOutlined,
  UploadOutlined,
  FolderAddOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import BookCard from "./components/BookCard";
import { IBook } from "../../models/Book";
import UploadBookModal from "./modal/UploadBookModal";
import {
  bookServiceRender,
  fileServiceRender,
  logServiceRender,
} from "../../app";
import { useNavigate } from "react-router-dom";
import TabPane from "antd/es/tabs/TabPane";
import BookList from "./components/BookList";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState<IBook[]>([]);
  const [recentlyReadBooks, setRecentlyReadBooks] = useState<IBook[]>([]);
  const [recentlyAddedTotal, setRecentlyAddedTotal] = useState(0);
  const [recentlyReadTotal, setRecentlyReadTotal] = useState(0);
  const [currentBookId, setCurrentBookId] = useState<Id | null>(null);
  const [recentlyAddedPage, setRecentlyAddedPage] = useState(1);
  const [recentlyReadPage, setRecentlyReadPage] = useState(1);
  const [activeTab, setActiveTab] = useState("1");

  const pageSize = 10;

  const fetchRecentlyAddedBooks = async (page: number) => {
    const result = await bookServiceRender.getLatestBooks(page, pageSize);
    if (result.success) {
      setRecentlyAddedBooks(result.payload.books);
      setRecentlyAddedTotal(result.payload.total);
    } else {
      logServiceRender.error(
        "Failed to fetch recently added books:",
        result.message
      );
      message.error("Failed to fetch recently added books");
    }
  };

  const fetchRecentlyReadBooks = async (page: number) => {
    const result = await bookServiceRender.getRecentlyReadBooks(page, pageSize);
    if (result.success) {
      setRecentlyReadBooks(result.payload.books);
      setRecentlyReadTotal(result.payload.total);
    } else {
      logServiceRender.error(
        "Failed to fetch recently read books:",
        result.message
      );
      message.error("Failed to fetch recently read books");
    }
  };

  useEffect(() => {
    fetchRecentlyAddedBooks(recentlyAddedPage);
  }, [recentlyAddedPage]);

  useEffect(() => {
    fetchRecentlyReadBooks(recentlyReadPage);
  }, [recentlyReadPage]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleRecentlyAddedPageChange = (page: number) => {
    setRecentlyAddedPage(page);
  };

  const handleRecentlyReadPageChange = (page: number) => {
    setRecentlyReadPage(page);
  };

  const handleUploadClickNew = async () => {
    try {
      const bookAddedResult = await bookServiceRender.addBook();
      if (!bookAddedResult.payload) {
        logServiceRender.error("Failed to add book:", bookAddedResult.message);
        message.error("添加图书失败");
        return;
      }
      const bookId: Id = bookAddedResult.payload._id;
      setCurrentBookId(bookId);
      setIsUploadModalOpen(true);
    } catch (error) {
      logServiceRender.error("处理添加图书时出错:", error);
      message.error("添加图书失败");
    }
  };

  // 添加处理函数
  const handleBatchUpload = async () => {
    try {
      const result = await fileServiceRender.selectDirectory();
      if (result.success && result.payload) {
        const selectedDir = result.payload;
        navigate(`/batch-upload?dir=${encodeURIComponent(selectedDir)}`);
      } else {
        message.info("未选择目录");
      }
    } catch (error) {
      logServiceRender.error("选择目录时出错:", error);
      message.error("选择目录失败");
    }
  };

  const handleEditBook = (id: Id) => {
    logServiceRender.info("handleUploadClickEdit id: ", id);
    setCurrentBookId(id);
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setCurrentBookId(null);
    fetchRecentlyAddedBooks(recentlyAddedPage);
    fetchRecentlyReadBooks(recentlyReadPage);
    message.success("书籍信息已更新");
  };

  const handleBookUpdated = () => {
    logServiceRender.info("Book updated");

    // 刷新最近添加的书籍列表
    fetchRecentlyAddedBooks(recentlyAddedPage);
    fetchRecentlyReadBooks(recentlyReadPage);

    // 关闭模态框
    setIsUploadModalOpen(false);
    setCurrentBookId(null);

    message.success("书籍信息已更新");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleWeixinReadClick = () => {
    navigate("/weixin-read");
  };

  return (
    <Layout className="homepage">
      <Header className="header">
        <Row>
          <Col>
            <Title level={2} style={{ color: "white", margin: 0 }}>
              <BookOutlined /> RayBook
            </Title>
          </Col>
          <Col>
            <Button
              icon={<BookOutlined />}
              type="primary"
              onClick={handleWeixinReadClick}
            >
              微信读书
            </Button>
          </Col>
          <Col>
            <Button
              icon={<UploadOutlined />}
              type="primary"
              style={{ marginLeft: "20px" }}
              onClick={handleUploadClickNew}
            >
              添加图书
            </Button>
          </Col>
          <Col>
            <Button
              icon={<FolderAddOutlined />}
              type="primary"
              style={{ marginLeft: "20px" }}
              onClick={handleBatchUpload}
            >
              批量添加书籍
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                同名自动合并
              </Text>
            </Button>
          </Col>
          <Col>
            <Button
              icon={<SettingOutlined />}
              type="primary"
              style={{ marginLeft: "20px" }}
              onClick={handleSettingsClick}
            >
              设置
            </Button>
          </Col>
        </Row>
      </Header>
      <UploadBookModal
        open={isUploadModalOpen}
        bookId={currentBookId}
        onClose={handleCloseModal}
        onBookUpdated={handleBookUpdated}
      />
      <Content className="content" style={{ padding: "0 50px" }}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="最近添加的书籍" key="1">
            <BookList
              books={recentlyAddedBooks}
              total={recentlyAddedTotal}
              currentPage={recentlyAddedPage}
              onPageChange={handleRecentlyAddedPageChange}
              onEditBook={handleEditBook}
            />
          </TabPane>
          <TabPane tab="最近阅读的书籍" key="2">
            <BookList
              books={recentlyReadBooks}
              total={recentlyReadTotal}
              currentPage={recentlyReadPage}
              onPageChange={handleRecentlyReadPageChange}
              onEditBook={handleEditBook}
            />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default HomePage;
