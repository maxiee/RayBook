import React, { useEffect, useState } from "react";
import { Card, Menu, Dropdown, MenuProps, Button } from "antd";
import {
  MoreOutlined,
  EditOutlined,
  ReadOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import { IBook } from "../../../models/Book";
const { ipcRenderer } = window.require("electron");
import { useNavigate } from "react-router-dom";
import { serializeId, toObjectId } from "../../../utils/DtoUtils";
import {
  bookCoverServiceRender,
  bookFileServiceRender,
  logServiceRender,
} from "../../../app";
import { IBookFile } from "../../../models/BookFile";

interface BookCardProps {
  book: IBook;
  onEdit: (id: Id) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit }) => {
  const navigate = useNavigate();
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [bookFiles, setBookFiles] = useState<IBookFile[]>([]);

  // 获取图书封面
  const getCoverImage = async (coverIamgePath: string) => {
    const result = await bookCoverServiceRender.getBookCover(coverIamgePath);
    if (result.success && result.payload) {
      setCoverUrl(result.payload);
    }
  };

  useEffect(() => {
    if (book.coverImagePath) getCoverImage(book.coverImagePath as string);
    fetchBookFiles();
  }, [book.coverImagePath]);

  const fetchBookFiles = async () => {
    const result = await bookFileServiceRender.getBookFiles(book._id);
    if (result.success) {
      setBookFiles(result.payload);
    }
  };

  const handleRead = (bookFileId: Id) => {
    const serializedBookId = serializeId(book._id);
    const serializedFileId = serializeId(bookFileId);
    navigate(`/read/${serializedBookId}/${serializedFileId}`);
  };

  const handleWeixinRead = () => {
    navigate(`/weixin-read?bookKey=${book.weixinBookKey}`);
  };

  const items: MenuProps["items"] = [
    {
      key: "edit",
      label: (
        <a onClick={() => onEdit(book._id)}>
          <EditOutlined />
          编辑
        </a>
      ),
    },
    ...bookFiles.map((file) => ({
      key: `read-${toObjectId(file._id).toHexString()}`,
      label: (
        <Button onClick={() => handleRead(file._id)} icon={<ReadOutlined />}>
          阅读 {file.format}
        </Button>
      ),
    })),
    ...(book.weixinBookKey
      ? [
          {
            key: "weixin-read",
            label: (
              <Button onClick={handleWeixinRead} icon={<WechatOutlined />}>
                微信阅读
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card
      size="small"
      hoverable
      cover={
        coverUrl ? (
          <img
            alt={book.title || "Book cover"}
            src={coverUrl}
            style={{ height: 300, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              height: 300,
              background: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            No Cover
          </div>
        )
      }
      actions={[
        <Dropdown menu={{ items }} placement="bottomRight">
          <MoreOutlined key="more" />
        </Dropdown>,
      ]}
      style={{ width: 200 }}
    >
      <Card.Meta
        title={book.title}
        description={book.author ? book.author : <br />}
      />
    </Card>
  );
};

export default BookCard;
