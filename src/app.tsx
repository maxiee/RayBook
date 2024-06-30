import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import ReaderPage from "./pages/reader/ReaderPage";
import { createIpcProxy } from "./core/ipc/IpcClient";
import { IBookService } from "./services/book/BookServiceInterface";
import { IBookFileService } from "./services/bookfile/BookFileServiceInterface";

export const bookServiceRender = createIpcProxy<IBookService>("BookService");
export const bookFileServiceRender = createIpcProxy<IBookFileService>("BookFileService");

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage />} />
        <Route path="/main_window" element={<HomePage />} />
        <Route path="/read/:bookId" element={<ReaderPage />} />
      </Routes>
    </Router>
  );
};

function render() {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(
    <App />
  );
}

render();