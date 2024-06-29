import React, { useEffect, useState } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Pagination, message } from 'antd';
import { BookOutlined, UploadOutlined } from '@ant-design/icons';
import BookCard from './components/BookCard';
import { IBook } from '../../models/Book';
import UploadBookModal from './modal/UploadBookModal';
import { IMetadata } from 'epub2/lib/epub/const';

const { ipcRenderer } = window.require('electron');

const { Header, Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;

const HomePage: React.FC = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [books, setBooks] = useState<IBook[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const [currentBookId, setCurrentBookId] = useState<Id | null>(null);
    const pageSize = 10;

    const fetchLatestBooks = async (page: number) => {
        const result = await ipcRenderer.invoke('get-latest-books', page, pageSize);
        console.log("fetchLatestBooks result: ", result);
        if (result.success) {
            setBooks(result.data);
            setTotalBooks(result.total);
            setCurrentPage(result.currentPage);
        } else {
            console.error('Failed to fetch latest books:', result.message);
        }
    };

    useEffect(() => {
        fetchLatestBooks(currentPage);
    }, [currentPage]);

    const handleUploadClickNew = async () => {
        try {
            const result = await ipcRenderer.invoke('add-new-book');
            const bookId: Id = result.bookId;
            setCurrentBookId(bookId);
            setIsUploadModalOpen(true);
        } catch (error) {
            console.error('处理添加图书时出错:', error);
            message.error('添加图书失败');
        }        
    };

    const handleUploadClickEdit = (id: Id) => {
        console.log("handleUploadClickEdit id: ", id);
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

    return (
        <Layout className="homepage">
            <Header className="header">
                <Row>
                    <Title level={2} style={{ color: 'white', margin: 0 }}>
                        <BookOutlined /> RayBook
                    </Title>
                    <Button
                        icon={<UploadOutlined />}
                        type="primary"
                        style={{ marginLeft: '20px' }}
                        onClick={handleUploadClickNew}>
                        添加图书
                    </Button>
                </Row>
            </Header>
            <UploadBookModal 
                open={isUploadModalOpen} 
                bookId={currentBookId}
                onClose={handleCloseModal}  />
            <Content className="content" style={{ padding: '0 50px' }}>
                <Title level={3} style={{ margin: '16px 0' }}>最近添加的书籍</Title>
                <Row gutter={[16, 16]}>
                    {books.map(book => {
                        console.log(book);
                        console.log(book.title);
                        return (
                            <Col key={book._id.buffer.toString()} xs={24} sm={12} md={8} lg={6} xl={4}>
                                <BookCard book={book} onEdit={() => {
                                    handleUploadClickEdit(book._id);
                                }} />
                            </Col>
                        );
                    })}
                </Row>
                <Pagination
                    current={currentPage}
                    total={totalBooks}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    style={{ marginTop: '20px', textAlign: 'center' }}
                />
            </Content>
        </Layout>
    );
};

export default HomePage;