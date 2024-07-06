import React, { useState, useEffect, Component } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { deserializeId } from "../../utils/DtoUtils";
import { ReactReader, EpubView } from "react-reader";
import { bookFileServiceRender, logServiceRender } from "../../app";
const { ipcRenderer } = window.require("electron");

const ReaderPage: React.FC = () => {
  const [epubData, setEpubData] = useState<ArrayBuffer | null>(null);
  const [location, setLocation] = useState<string | number>(0);
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookFile = async () => {
      logServiceRender.info("Fetching book file");
      try {
        const id = deserializeId(bookId);
        const result = await bookFileServiceRender.getBookFileContent(id);
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
  }, [bookId]);

  const handleLocationChanged = (newLocation: string) => {
    setLocation(newLocation);
    // You can save the location to the database or local storage here
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")}
        style={{ margin: "10px" }}
      >
        Back to Library
      </Button>
      {epubData ? (
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
