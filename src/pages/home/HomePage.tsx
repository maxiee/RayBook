import React, { useEffect, useState } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Pagination } from 'antd';
import { BookOutlined, UploadOutlined } from '@ant-design/icons';
import UploadBookModal from './modal/UploadBookModal';

const { ipcRenderer } = window.require('electron');

const { Header, Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;

const HomePage: React.FC = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const pageSize = 10;

    const fetchLatestBooks = async (page: number) => {
        const result = await ipcRenderer.invoke('get-latest-books', page, pageSize);
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

    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsUploadModalOpen(false);
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
                        onClick={handleUploadClick}>
                        添加图书
                    </Button>
                </Row>
            </Header>
            <UploadBookModal open={isUploadModalOpen} onClose={handleCloseModal} />
            <Content className="content" style={{ padding: '0 50px' }}>
                <Title level={3} style={{ margin: '16px 0' }}>最近添加的书籍</Title>
                <Row gutter={[16, 16]}>
                    {books.map(book => {
                        console.log(book);
                        console.log(book.title);
                        return (
                            <Col key={book.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                                <Card
                                    hoverable
                                    cover={book.coverImage && book.coverImage.data ? (
                                        <img
                                            alt={book.title || 'Book cover'}
                                            src={`data:${book.coverImage.contentType};base64,${book.coverImage.data}`}
                                            style={{ height: 300, objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ height: 300, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            No Cover
                                        </div>
                                    )}
                                    style={{ width: 200 }}
                                >
                                    <Meta title={book.title} description={book.author} />
                                </Card>
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