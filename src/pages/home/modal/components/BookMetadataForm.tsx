import React from 'react';
import { Form, Input, InputNumber, Row, Col, Upload, Button, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { IBook } from '../../../../models/Book';

interface BookMetadataFormProps {
  form: any;
  coverUrl: string | null;
  onCoverUpload: (file: File) => void;
}

const BookMetadataForm: React.FC<BookMetadataFormProps> = ({
  form,
  coverUrl,
  onCoverUpload,
}) => {
  return (
    <Form form={form} layout="vertical">
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
          <Form.Item name="coverImagePath" label="封面图">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt="Book Cover"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            ) : (
              <Upload
                beforeUpload={(file) => {
                  onCoverUpload(file);
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>点击上传封面</Button>
              </Upload>
            )}
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default BookMetadataForm;