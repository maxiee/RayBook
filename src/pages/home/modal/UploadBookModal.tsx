import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, InputNumber, Image, Row, Col, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ipcRenderer } from 'electron';

const UploadBookModal: React.FC<{ open: boolean; onClose: () => void; }> = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const [coverBase64, setCoverBase64] = useState<string | null>(null);
    const [coverMimeType, setCoverMimeType] = useState<string | null>(null);

    const handleSubmit = async (values: any) => {
        try {
          const result = await ipcRenderer.invoke('add-book', {
            ...values,
            coverBase64: coverBase64,
            contentType: coverMimeType
            // epubPath: values.epubPath // 假设我们在上传 EPUB 时已经保存了文件路径
          });
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
            const result = await ipcRenderer.invoke('upload-epub');
            console.log(result)
            if (result.success) {
                form.setFieldsValue(result.metadata);
                if (result.metadata.coverBase64) {
                    setCoverBase64(result.metadata.coverBase64);
                }
                setCoverMimeType(result.metadata.coverMimeType);
                message.success('成功读取电子书信息');
            } else {
                message.error('读取电子书信息失败');
            }
        } catch (error) {
            console.error('上传文件时出错:', error);
            message.error('上传文件失败');
        }
        
    };

    return <Modal
            title="添加图书"
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="上传"
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
                                    src={coverBase64}
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
                    <Col span={12}>
                        <Button icon={<UploadOutlined />} onClick={handleFileUpload}>
                            点击上传电子书
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Modal>
};

export default UploadBookModal;