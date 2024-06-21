import React from "react";
import ReactDOM from "react-dom/client";
import HomePage from "./pages/home/HomePage";

function render() {
    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement);
    root.render(
        <HomePage />
    );
}

render();