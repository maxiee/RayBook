import React, { useEffect } from 'react';
import { Card, Menu, Dropdown, MenuProps } from 'antd';
import { MoreOutlined, EditOutlined } from '@ant-design/icons';
import { IBook } from '../../../models/Book';
const { ipcRenderer } = window.require('electron');

interface BookCardProps {
    book: IBook;
    onEdit: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit }) => {
    const [coverImage, setCoverImage] = React.useState<Buffer | null>(null);

    // 获取图书封面
    const getCoverImage = async (coverIamgePath: string) => {
        const result = await ipcRenderer.invoke('get-book-cover', coverIamgePath);
        if (result.success) {
            setCoverImage(result.data);
        }
    };

    useEffect(() => {
        getCoverImage(book._id as string);
    }, [book.coverImagePath]);

    const items: MenuProps['items'] = [
        {
            key: 'edit',
            label: (
                <a onClick={() => onEdit(book._id as string)}>
                    <EditOutlined />
                    编辑
                </a>
            ),
        },
    ];

    return (
        <Card size="small"
            hoverable
            cover={coverImage ? (
                <img
                    alt={book.title || 'Book cover'}
                    src={`data:image/${book.coverImagePath.split('.').pop()};base64,${coverImage.toString('base64')}`}
                    style={{ height: 300, objectFit: 'cover' }}
                />
            ) : (
                <div style={{ height: 300, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    No Cover
                </div>
            )}
            actions={[
                <Dropdown menu={{ items }} placement="bottomRight">
                    <MoreOutlined key="more" />
                </Dropdown>,
            ]}
            style={{ width: 200 }}
        >
            <Card.Meta title={book.title} description={book.author} />
        </Card>
    );
};

export default BookCard;