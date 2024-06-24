import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Button, InputNumber, Image, Row, Col, message, Table } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { ipcRenderer } from 'electron';
import { IBook, IBookFile } from '../../../types/Book';

const UploadBookModal: React.FC<{
    open: boolean;
    onClose: () => void;
    bookId: string | null;
}> = ({ open, onClose, bookId }) => {
    const [form] = Form.useForm();
    const [coverBase64, setCoverBase64] = useState<string | null>(null);
    const [coverMimeType, setCoverMimeType] = useState<string | null>(null);
    const [bookFiles, setBookFiles] = useState<IBookFile[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        console.log("UploadBookModal Effect bookId: ", bookId);
        if (bookId) {
            setIsEditMode(true);
            fetchBookDetails(bookId);
        } else {
            setIsEditMode(false);
            resetForm();
        }
    }, [bookId]);

    const fetchBookDetails = async (id: string) => {
        try {
            const result = await ipcRenderer.invoke('get-book-details', id);
            if (result.success) {
                const book: IBook = result.book;
                form.setFieldsValue(book);
                setCoverBase64(book.coverImage?.data || null);
                setCoverMimeType(book.coverImage?.contentType || null);
                setBookFiles(book.files);
            } else {
                message.error('获取书籍详情失败');
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
            message.error('获取书籍详情时出错');
        }
    };

    const resetForm = () => {
        form.resetFields();
        setCoverBase64(null);
        setCoverMimeType(null);
        setBookFiles([]);
    };

    // 添加电子书元信息
    const handleSubmit = async (values: any) => {
        try {
            const bookData: Partial<IBook> = {
                ...values,
                coverImage: coverBase64 ? {
                    data: coverBase64,
                    contentType: coverMimeType || ''
                } : undefined,
                files: bookFiles.map(file => file._id),
                _id: isEditMode ? bookId : undefined
            };
            const result = await ipcRenderer.invoke(isEditMode ? 'update-book' : 'add-book', bookData);
            if (result.success) {
                message.success(result.message);
                onClose();
            } else {
                message.error(result.message);
            }
        } catch (error) {
            console.error('提交表单时出错:', error);
            message.error('提交表单失败');
        }
    };

    // 上传电子书文件
    const handleFileUpload = async () => {
        try {
            const result = await ipcRenderer.invoke('upload-book-file');
            if (result.success) {
                // 检查文件是否已存在
                const fileExists = bookFiles.some(file => file.path === result.file.path);
                if (!fileExists) {
                    setBookFiles([...bookFiles, result.file]);
                    message.success('成功添加电子书文件');
                } else {
                    message.warning('该文件已存在，请勿重复添加');
                }
            } else {
                message.error('添加电子书文件失败');
            }
        } catch (error) {
            console.error('上传文件时出错:', error);
            message.error('上传文件失败');
        }
    };

    const handleFileDelete = async (fileId: string) => {
        try {
            if (isEditMode) {
                const result = await ipcRenderer.invoke('delete-book-file', fileId);
                if (result.success) {
                    setBookFiles(bookFiles.filter(file => file._id !== fileId));
                    message.success('成功删除文件');
                } else {
                    message.error('删除文件失败');
                }
            } else {
                setBookFiles(bookFiles.filter(file => file._id !== fileId));
            }
        } catch (error) {
            console.error('删除文件时出错:', error);
            message.error('删除文件失败');
        }
    };

    const columns = [
        { title: '文件名', dataIndex: 'filename', key: 'filename' },
        { title: '格式', dataIndex: 'format', key: 'format' },
        { title: '大小', dataIndex: 'size', key: 'size' },
        {
            title: '操作',
            key: 'action',
            render: (text: any, record: any, index: number) => (
                <Button icon={<DeleteOutlined />} onClick={() => handleFileDelete(record._id)}>删除</Button>
            ),
        },
    ];

    return <Modal
        title={isEditMode ? "编辑图书" : "添加图书"}
        open={open}
        onCancel={onClose}
        onOk={() => form.submit()}
        okText={isEditMode ? "更新" : "上传"}
        cancelText="取消"
        width={800}
    >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
                <Col span={9}>
                    <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={9}>
                    <Form.Item name="subtitle" label="副标题">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="series" label="丛书">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={9}>
                    <Form.Item name="author" label="作者" rules={[{ message: '请输入作者名' }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={9}>
                    <Form.Item name="translator" label="译者">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="originalTitle" label="原作名称">
                        <Input />
                    </Form.Item>
                </Col>

            </Row>
            <Row gutter={16}>
                <Col span={9}>
                    <Form.Item name="publisher" label="出版社">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={9}>
                    <Form.Item name="publicationYear" label="出版年">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item name="isbn" label="ISBN">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="cover" label="封面图">
                        {coverBase64 ? (
                            <Image
                                src={`data:${coverMimeType};base64,${coverBase64}`}
                                alt="Book Cover"
                                style={{ maxWidth: '100%', maxHeight: '300px' }}
                            />
                        ) : (
                            <Upload>
                                <Button icon={<UploadOutlined />}>点击上传封面</Button>
                            </Upload>
                        )}
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item label="电子书文件">
                        <Button icon={<UploadOutlined />} onClick={handleFileUpload}>
                            添加电子书文件
                        </Button>
                        <Table dataSource={bookFiles} columns={columns} />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    </Modal>;
};

export default UploadBookModal;