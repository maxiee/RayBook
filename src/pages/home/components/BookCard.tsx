import React from 'react';
import { Card, Menu, Dropdown, MenuProps } from 'antd';
import { MoreOutlined, EditOutlined } from '@ant-design/icons';
import { IBook } from '../../../types/Book';

interface BookCardProps {
    book: IBook;
    onEdit: (id: string) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit }) => {
    const items: MenuProps['items'] = [
        {
          key: 'edit',
          label: (
            <a onClick={() => onEdit(book._id)}>
              <EditOutlined/>
              编辑
            </a>
          ),
        },
      ];

    return (
        <Card size="small"
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
            actions={[
                <Dropdown menu={{items}} placement="bottomRight">
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