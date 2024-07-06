import React, { useEffect, useState } from "react";
import { Card, Menu, Dropdown, MenuProps } from "antd";
import { MoreOutlined, EditOutlined, ReadOutlined } from "@ant-design/icons";
import { IBook } from "../../../models/Book";
const { ipcRenderer } = window.require("electron");
import { useNavigate } from "react-router-dom";
import { serializeId, toObjectId } from "../../../utils/DtoUtils";
import { bookCoverServiceRender, logServiceRender } from "../../../app";

interface BookCardProps {
  book: IBook;
  onEdit: (id: Id) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onEdit }) => {
  const navigate = useNavigate();

  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // 获取图书封面
  const getCoverImage = async (coverIamgePath: string) => {
    const result = await bookCoverServiceRender.getBookCover(coverIamgePath);
    if (result.success && result.payload) {
      setCoverUrl(result.payload);
    }
  };

  useEffect(() => {
    if (book.coverImagePath) getCoverImage(book.coverImagePath as string);
  }, [book.coverImagePath]);

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
    {
      key: "read",
      label: (
        <a
          onClick={() => {
            logServiceRender.info(toObjectId(book._id).toHexString());
            const serializedId = serializeId(book._id);
            navigate(`/read/${serializedId}`);
          }}
        >
          <ReadOutlined />
          阅读
        </a>
      ),
    },
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
