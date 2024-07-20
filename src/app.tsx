import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
  MemoryRouter,
} from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import ReaderPage from "./pages/reader/epub/ReaderPage";
import { createIpcProxy } from "./core/ipc/IpcClient";
import { IBookService } from "./services/book/BookServiceInterface";
import { IBookFileService } from "./services/bookfile/BookFileServiceInterface";
import { IBookCoverService } from "./services/bookcover/BookCoverServiceInterface";
import { IFileService } from "./services/file/FileServiceInterface";
import { IEpubService } from "./services/epub/EpubServiceInterface";
import BatchUploadPage from "./pages/batchupload/BatchUploadPage";
import { ILogService } from "./services/log/LogServiceInterface";
import SettingsPage from "./pages/settings/SettingsPage";
import { configStore } from "./config/ConfigStore";
import Sha256CompletionPage from "./pages/settings/toolbox/Sha256CompletionPage";

export const bookServiceRender = createIpcProxy<IBookService>("BookService");
export const bookFileServiceRender =
  createIpcProxy<IBookFileService>("BookFileService");
export const bookCoverServiceRender =
  createIpcProxy<IBookCoverService>("BookCoverService");
export const fileServiceRender = createIpcProxy<IFileService>("FileService");
export const epubServiceRender = createIpcProxy<IEpubService>("EpubService");
export const logServiceRender = createIpcProxy<ILogService>("LogService");

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    logServiceRender.info("AppRoutes started");
    if (!configStore.hasRequiredConfig()) {
      if (location.pathname !== "/settings") {
        navigate("/settings");
      }
    }
  }, [navigate, location]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/main_window" element={<HomePage />} />
      <Route path="/read/:bookId/:fileId" element={<ReaderPage />} />
      <Route path="/batch-upload" element={<BatchUploadPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route
        path="/sha256-complementation"
        element={<Sha256CompletionPage />}
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <AppRoutes />
    </MemoryRouter>
  );
};

function render() {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(<App />);
}

render();
