import React, { useEffect, useState } from "react";
import { Modal, Form, message, Tabs } from "antd";
import { ipcRenderer } from "electron";
import { IBookFile } from "../../../models/BookFile";
import { IBook } from "../../../models/Book";
import BookMetadataForm from "./components/BookMetadataForm";
import BookFilesManager from "./components/BookFilesManager";
import {
  bookCoverServiceRender,
  bookFileServiceRender,
  bookServiceRender,
  logServiceRender,
} from "../../../app";

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
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    if (bookId) {
      fetchBookDetails(bookId);
    } else {
      resetForm();
    }
  }, [bookId]);

  const fetchBookDetails = async (id: Id) => {
    try {
      const _book = await bookServiceRender.findBookById(id);
      if (!_book.success || !_book.payload) {
        message.error("获取书籍详情失败");
        return;
      }
      logServiceRender.debug("Fetched book details:", _book.payload);
      setBook(_book.payload);
      form.setFieldsValue({
        ..._book.payload,
        weixinBookKey: _book.payload.weixinBookKey || "",
        weixinBookId: _book.payload.weixinBookId || "",
      });
      logServiceRender.debug("Form values set:", form.getFieldsValue());

      if (_book.payload.coverImagePath) {
        const coverResult = await bookCoverServiceRender.getBookCover(
          _book.payload.coverImagePath
        );
        if (coverResult.success && coverResult.payload) {
          setCoverUrl(coverResult.payload);
        }
      }

      const _bookFilesResult = await bookFileServiceRender.getBookFiles(id);
      if (_bookFilesResult.success) setBookFiles(_bookFilesResult.payload);
    } catch (error) {
      logServiceRender.error("Error fetching book details:", error);
      message.error("获取书籍详情时出错");
    }
  };

  const resetForm = () => {
    form.resetFields();
    setBookFiles([]);
  };

  const handleMetadataSubmit = async () => {
    if (!book || !book._id) {
      message.error("书籍信息尚未加载完成，请稍后再试");
      return;
    }
    try {
      const values = await form.validateFields();
      const bookData: Partial<IBook> = {
        ...values,
        weixinBookKey: values.weixinBookKey || null,
        weixinBookId: values.weixinBookId || null,
      };
      const updatedResult = await bookServiceRender.updateBook(
        book._id,
        bookData
      );
      form.setFieldsValue(updatedResult.payload);
      if (updatedResult.success) {
        message.success(updatedResult.message);
        onClose();
      } else {
        message.error(updatedResult.message);
      }
    } catch (error) {
      logServiceRender.error("提交表单时出错:", error);
      message.error("提交表单失败");
    }
  };

  const handleFileUpload = async () => {
    try {
      const result = await bookFileServiceRender.uploadBookFile(bookId);
      if (result.success && result.payload) {
        const fileExists = bookFiles.some(
          (file) => file.path === result.payload.path
        );
        if (!fileExists) {
          setBookFiles([...bookFiles, result.payload]);
          message.success("成功添加电子书文件");
        } else {
          message.warning("该文件已存在，请勿重复添加");
        }
      } else {
        message.error("添加电子书文件失败: " + result.message);
      }
    } catch (error) {
      logServiceRender.error("上传文件时出错:", error);
      message.error("上传文件失败: " + error.message);
    }
  };

  const handleFileDelete = async (fileId: Id) => {
    try {
      const result = await ipcRenderer.invoke("delete-book-file", fileId);
      if (result.success) {
        setBookFiles(
          bookFiles.filter((file) => file._id.buffer !== fileId.buffer)
        );
        message.success("成功删除文件");
      } else {
        message.error("删除文件失败");
      }
    } catch (error) {
      logServiceRender.error("删除文件时出错:", error);
      message.error("删除文件失败");
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
        message.error("请先保存图书信息");
        return;
      }
      const result = await bookCoverServiceRender.extractBookCover(
        bookId,
        fileId
      );
      if (result.success) {
        message.success("成功提取封面");
        setCoverUrl(result.payload);
        setActiveTab("1"); // Switch to the metadata tab
        // 更新 form 中的 coverImagePath
        form.setFieldsValue({ coverImagePath: result.payload });
      } else {
        message.error("提取封面失败");
      }
    } catch (error) {
      logServiceRender.error("提取封面时出错:", error);
      message.error("提取封面失败");
    }
  };

  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
  };

  return (
    <Modal
      title="编辑图书"
      open={open}
      onCancel={onClose}
      onOk={() => (activeTab === "1" ? handleMetadataSubmit() : onClose())}
      okText={activeTab === "1" ? "更新" : "完成"}
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
            bookId={bookId}
            bookFiles={bookFiles}
            onFileUpload={handleFileUpload}
            onFileDelete={handleFileDelete}
            onExtractCover={handleExtractCover}
            onFilesUpdate={() => fetchBookDetails(bookId)}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default UploadBookModal;
