import React, { useState, useEffect, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { deserializeId } from "../../../utils/DtoUtils";
import { ReactReader, EpubView } from "react-reader";
import { bookFileServiceRender, logServiceRender } from "../../../app";
import { useBookLocation } from "./hooks/useBookLocation";

const ReaderPage: React.FC = () => {
  const [epubData, setEpubData] = useState<ArrayBuffer | null>(null);
  const { bookId, fileId } = useParams<{ bookId: string; fileId: string }>();
  const navigate = useNavigate();
  const { location, setLocation, saveLocation, isLoading } =
    useBookLocation(fileId);

  useEffect(() => {
    const fetchBookFile = async () => {
      logServiceRender.info("Fetching book file");
      try {
        const result = await bookFileServiceRender.getBookFileContent(
          deserializeId(bookId),
          deserializeId(fileId)
        );
        if (result.success) {
          setEpubData(result.payload.buffer);
        } else {
          message.error("Failed to load the book");
        }
      } catch (error) {
        logServiceRender.error("Error fetching book file:", error);
        message.error("An error occurred while loading the book");
      }
    };

    if (bookId) {
      fetchBookFile();
    }
  }, [bookId, fileId]);

  const handleLocationChanged = (newLocation: string) => {
    if (!isLoading) {
      logServiceRender.debug("Location changed:", newLocation);
      setLocation(newLocation);
    }
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
      {!isLoading && epubData ? (
        <div style={{ flex: 1 }}>
          <ReactReader
            url={epubData}
            location={location}
            locationChanged={handleLocationChanged}
          />
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default ReaderPage;
