import React from "react";
import { Row, Col, Pagination } from "antd";
import BookCard from "./BookCard";
import { IBook } from "../../../models/Book";

interface BookListProps {
  books: IBook[];
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEditBook: (id: Id) => void;
}

const BookList: React.FC<BookListProps> = ({
  books,
  total,
  currentPage,
  onPageChange,
  onEditBook,
}) => {
  return (
    <>
      <Row gutter={[16, 16]}>
        {books.map((book) => (
          <Col
            key={book._id.buffer.toString()}
            xs={24}
            sm={12}
            md={8}
            lg={6}
            xl={4}
          >
            <BookCard book={book} onEdit={() => onEditBook(book._id)} />
          </Col>
        ))}
      </Row>
      <Pagination
        current={currentPage}
        total={total}
        pageSize={10}
        onChange={onPageChange}
        style={{ marginTop: "20px", textAlign: "center" }}
      />
    </>
  );
};

export default BookList;
