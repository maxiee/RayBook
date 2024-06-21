import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UploadBookModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values: any) => {
        console.log("提交表单：", values);
        onClose(); // 关闭模态框
    };

    return (
        <Modal
            title="上传新书"
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="上传"
            cancelText="取消"
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="author" label="作者" rules={[{ required: true, message: '请输入作者名' }]}>
                    <Input />
                </Form.Item>
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