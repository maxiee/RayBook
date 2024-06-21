import React from 'react';
import { Modal, Form, Input, Upload, Button, InputNumber, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UploadBookModal: React.FC<{ open: boolean; onClose: () => void; }> = ({ open, onClose }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values: any) => {
        console.log("提交表单：", values);
        onClose();
    };

    return (
        <Modal
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
                    <Col span={8}>
                        <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="subtitle" label="副标题">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="series" label="丛书">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="author" label="作者" rules={[{ message: '请输入作者名' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="translator" label="译者">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="originalTitle" label="原作名称">
                            <Input />
                        </Form.Item>
                    </Col>

                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="publisher" label="出版社">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="publicationYear" label="出版年">
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item name="isbn" label="ISBN" rules={[{ pattern: /^(?:\d{10}|\d{13})$/, message: '请输入有效的 ISBN' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="cover" label="封面图">
                    <Upload>
                        <Button icon={<UploadOutlined />}>点击上传封面</Button>
                    </Upload>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UploadBookModal;