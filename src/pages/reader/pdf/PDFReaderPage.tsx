import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { pdfjs, Document, Page } from "react-pdf";
import { deserializeId } from "../../../utils/DtoUtils";
import {
  bookFileServiceRender,
  bookServiceRender,
  logServiceRender,
} from "../../../app";
import { useBookLocation } from "../epub/hooks/useBookLocation";
const { ipcRenderer } = window.require("electron");
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PDFReaderPage: React.FC = () => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const { bookId, fileId } = useParams<{ bookId: string; fileId: string }>();
  const navigate = useNavigate();
  const { location, setLocation, saveLocation, isLoading } =
    useBookLocation(fileId);

  const pdfFile = useMemo(() => {
    if (pdfData) {
      return { data: pdfData };
    }
    return null;
  }, [pdfData]);

  useEffect(() => {
    const fetchBookFile = async () => {
      logServiceRender.info("Fetching PDF file");
      try {
        const result = await bookFileServiceRender.getBookFileContent(
          deserializeId(bookId),
          deserializeId(fileId)
        );
        if (result.success) {
          logServiceRender.debug("PDF file fetched successfully");
          setPdfData(result.payload);
          if (location) {
            setPageNumber(parseInt(location));
          }
        } else {
          message.error("Failed to load the PDF");
        }
      } catch (error) {
        logServiceRender.error("Error fetching PDF file:", error);
        message.error("An error occurred while loading the PDF");
      }
    };

    const setupPdfWorker = async () => {
      const workerPath = await ipcRenderer.invoke("get-pdf-worker-path");
      pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
    };

    const effect = async () => {
      await setupPdfWorker();

      if (bookId) {
        if (!pdfData) {
          await fetchBookFile();
        }
        // Update last read time
        await bookServiceRender.updateLastReadTime(deserializeId(bookId));
      }
    };

    effect();
  }, [bookId, fileId, location, pdfData]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageChange = (newPageNumber: number) => {
    setPageNumber(newPageNumber);
    setLocation(newPageNumber.toString());
  };

  const handleBackClick = async () => {
    await saveLocation();
    navigate("/");
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBackClick}
        style={{ margin: "10px" }}
      >
        Back to Library
      </Button>
      {!isLoading && pdfFile ? (
        <div style={{ flex: 1, overflow: "auto" }}>
          <Document file={pdfFile} onLoadSuccess={handleDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} />
          </Document>
          <div>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <Button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= numPages}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default PDFReaderPage;
