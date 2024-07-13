import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Row,
  Col,
  Button,
  Pagination,
  message,
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

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [books, setBooks] = useState<IBook[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [currentBookId, setCurrentBookId] = useState<Id | null>(null);
  const pageSize = 10;

  const fetchLatestBooks = async (page: number) => {
    const result = await bookServiceRender.getLatestBooks(page, pageSize);
    logServiceRender.info("fetchLatestBooks result: ", result);
    if (result.success) {
      setBooks(result.payload.books);
      setTotalBooks(result.payload.total);
      setCurrentPage(page);
    } else {
      logServiceRender.error("Failed to fetch latest books:", result.message);
    }
  };

  useEffect(() => {
    fetchLatestBooks(currentPage);
  }, [currentPage]);

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

  const handleUploadClickEdit = (id: Id) => {
    logServiceRender.info("handleUploadClickEdit id: ", id);
    setCurrentBookId(id);
    setIsUploadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setCurrentBookId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <Layout className="homepage">
      <Header className="header">
        <Row>
          <Title level={2} style={{ color: "white", margin: 0 }}>
            <BookOutlined /> RayBook
          </Title>
          <Button
            icon={<UploadOutlined />}
            type="primary"
            style={{ marginLeft: "20px" }}
            onClick={handleUploadClickNew}
          >
            添加图书
          </Button>
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
          <Button
            icon={<SettingOutlined />}
            type="primary"
            style={{ marginLeft: "20px" }}
            onClick={handleSettingsClick}
          >
            设置
          </Button>
        </Row>
      </Header>
      <UploadBookModal
        open={isUploadModalOpen}
        bookId={currentBookId}
        onClose={handleCloseModal}
      />
      <Content className="content" style={{ padding: "0 50px" }}>
        <Title level={3} style={{ margin: "16px 0" }}>
          最近添加的书籍
        </Title>
        <Row gutter={[16, 16]}>
          {books.map((book) => {
            logServiceRender.info(book.title);
            return (
              <Col
                key={book._id.buffer.toString()}
                xs={24}
                sm={12}
                md={8}
                lg={6}
                xl={4}
              >
                <BookCard
                  book={book}
                  onEdit={() => {
                    handleUploadClickEdit(book._id);
                  }}
                />
              </Col>
            );
          })}
        </Row>
        <Pagination
          current={currentPage}
          total={totalBooks}
          pageSize={pageSize}
          onChange={handlePageChange}
          style={{ marginTop: "20px", textAlign: "center" }}
        />
      </Content>
    </Layout>
  );
};

export default HomePage;
