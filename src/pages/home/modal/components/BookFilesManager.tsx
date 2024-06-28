import React from 'react';
import { Button, Table, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { IBookFile } from '../../../../models/BookFile';

interface BookFilesManagerProps {
  bookFiles: IBookFile[];
  onFileUpload: () => void;
  onFileDelete: (fileId: Id) => void;
}

const BookFilesManager: React.FC<BookFilesManagerProps> = ({
  bookFiles,
  onFileUpload,
  onFileDelete,
}) => {
  const columns = [
    { title: '文件名', dataIndex: 'filename', key: 'filename' },
    { title: '格式', dataIndex: 'format', key: 'format' },
    { title: '大小', dataIndex: 'size', key: 'size' },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: IBookFile) => (
        <Button icon={<DeleteOutlined />} onClick={() => onFileDelete(record._id)}>
          删除
        </Button>
      ),
    },
  ];
  
  console.log("bookFiles: ", bookFiles);

  return (
    <>
      <Button icon={<UploadOutlined />} onClick={onFileUpload} style={{ marginBottom: 16 }}>
        添加电子书文件
      </Button>
      <Table
        dataSource={bookFiles}
        columns={columns}
        rowKey="_id"
      />
    </>
  );
};

export default BookFilesManager;