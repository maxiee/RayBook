import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import ReaderPage from "./pages/reader/ReaderPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
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
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

render();