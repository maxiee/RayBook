import React, { useEffect, useState } from 'react';
import { Modal, Form, message, Tabs } from 'antd';
import { ipcRenderer } from 'electron';
import { IBookFile } from '../../../models/BookFile';
import { IBook } from '../../../models/Book';
import BookMetadataForm from './components/BookMetadataForm';
import BookFilesManager from './components/BookFilesManager';
import { IMetadata } from 'epub2/lib/epub/const';

const { TabPane } = Tabs;

const UploadBookModal: React.FC<{
    open: boolean;
    onClose: () => void;
    bookId: Id | null;
}> = ({ open, onClose, bookId }) => {
    const [form] = Form.useForm();
    const [book, setBook] = useState<IBook | null>(null);
    const [coverUrl, setCoverUrl] = useState<string | null>(null);
    const [bookFiles, setBookFiles] = useState<IBookFile[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('1');

    useEffect(() => {
        if (bookId) {
            setIsEditMode(true);
            fetchBookDetails(bookId);
        } else {
            setIsEditMode(false);
            resetForm();
        }
    }, [bookId]);

    const fetchBookDetails = async (id: Id) => {
        try {
            const _book: IBook | null = await ipcRenderer.invoke('get-book-details', id);
            if (!_book) {
                message.error('获取书籍详情失败');
                return;
            }
            setBook(_book);
            form.setFieldsValue(_book);

            if (_book.coverImagePath) {
                const coverImage = await ipcRenderer.invoke('get-book-cover', _book.coverImagePath);
                if (coverImage) setCoverUrl(coverImage.coverUrl);
            }

            const _bookFiles = await ipcRenderer.invoke('get-book-files', id);
            if (_bookFiles) setBookFiles(_bookFiles);
        } catch (error) {
            console.error('Error fetching book details:', error);
            message.error('获取书籍详情时出错');
        }
    };

    const resetForm = () => {
        form.resetFields();
        setBookFiles([]);
    };

    const handleMetadataSubmit = async () => {
        try {
            const values = await form.validateFields();
            const bookData: Partial<IBook> = {
                ...values,
                // coverImage: coverBase64
                //     ? {
                //         data: coverBase64,
                //         contentType: coverMimeType || '',
                //     }
                //     : undefined,
                _id: isEditMode ? bookId : undefined,
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

    const handleFileUpload = async () => {
        try {
            const result = await ipcRenderer.invoke('upload-book-file', bookId || '');
            if (result.success) {
                const fileExists = bookFiles.some((file) => file.path === result.file.path);
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

    const handleFileDelete = async (fileId: Id) => {
        try {
            if (isEditMode) {
                const result = await ipcRenderer.invoke('delete-book-file', fileId);
                if (result.success) {
                    setBookFiles(bookFiles.filter((file) => file._id.buffer !== fileId.buffer));
                    message.success('成功删除文件');
                } else {
                    message.error('删除文件失败');
                }
            } else {
                setBookFiles(bookFiles.filter((file) => file._id.buffer !== fileId.buffer));
            }
        } catch (error) {
            console.error('删除文件时出错:', error);
            message.error('删除文件失败');
        }
    };

    const handleCoverUpload = (file: File) => {
        // const reader = new FileReader();
        // reader.onload = (e) => {
        //     if (e.target && e.target.result) {
        //         setCoverBase64(e.target.result.toString().split(',')[1]);
        //         setCoverMimeType(file.type);
        //     }
        // };
        // reader.readAsDataURL(file);
    };

    const handleExtractCover = async (fileId: Id) => {
        try {
            if (!bookId) {
                message.error('请先保存图书信息');
                return;
            }
            const result = await ipcRenderer.invoke('extract-cover', bookId, fileId);
            if (result.success) {
                message.success('成功提取封面');
                setCoverUrl(result.coverUrl);
                setActiveTab('1'); // Switch to the metadata tab
                // 更新 form 中的 coverImagePath
                form.setFieldsValue({ coverImagePath: result.coverUrl });
            } else {
                message.error('提取封面失败');
            }
        } catch (error) {
            console.error('提取封面时出错:', error);
            message.error('提取封面失败');
        }
    };

    const handleTabChange = (activeKey: string) => {
        setActiveTab(activeKey);
    };

    return (
        <Modal
            title={isEditMode ? '编辑图书' : '添加图书'}
            open={open}
            onCancel={onClose}
            onOk={() => (activeTab === '1' ? handleMetadataSubmit() : onClose())}
            okText={activeTab === '1' ? (isEditMode ? '更新' : '上传') : '完成'}
            cancelText="取消"
            width={800}
        >
            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane tab="图书信息" key="1">
                    <BookMetadataForm
                        form={form}
                        coverUrl={coverUrl}
                        onCoverUpload={handleCoverUpload}
                    />
                </TabPane>
                <TabPane tab="电子书文件" key="2">
                    <BookFilesManager
                        bookFiles={bookFiles}
                        onFileUpload={handleFileUpload}
                        onFileDelete={handleFileDelete}
                        onExtractCover={handleExtractCover}
                    />
                </TabPane>
            </Tabs>
        </Modal>
    );
};

export default UploadBookModal;