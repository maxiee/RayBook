import React from 'react';
import { Layout, Typography, Row, Col, Card } from 'antd';
import { BookOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Meta } = Card;

// 假数据
const books = [
    { id: 1, title: '1984', author: 'George Orwell', coverUrl: 'https://placekitten.com/200/300' },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://placekitten.com/200/301' },
    { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://placekitten.com/200/302' },
    { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://placekitten.com/200/303' },
    { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', coverUrl: 'https://placekitten.com/200/304' },
    { id: 6, title: 'Moby-Dick', author: 'Herman Melville', coverUrl: 'https://placekitten.com/200/305' },
];

const HomePage: React.FC = () => {
    return (
        <Layout className="homepage">
            <Header className="header">
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                    <BookOutlined /> RayBook
                </Title>
            </Header>
            <Content className="content" style={{ padding: '0 50px' }}>
                <Title level={3} style={{ margin: '16px 0' }}>最近添加的书籍</Title>
                <Row gutter={[16, 16]}>
                    {books.map(book => (
                        <Col key={book.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                            <Card
                                hoverable
                                cover={<img alt={book.title} src={book.coverUrl} />}
                                style={{ width: 200 }}
                            >
                                <Meta title={book.title} description={book.author} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Content>
        </Layout>
    );
};

export default HomePage;