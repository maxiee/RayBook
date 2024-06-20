import React from "react";
import ReactDOM from "react-dom/client";

function render() {
    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement);
    root.render(
        <h2>Hello from React!</h2>
    );
}

render();