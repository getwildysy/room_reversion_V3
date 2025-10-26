import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./AuthContext"; // 1. 匯入 AuthProvider

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* 2. 用 AuthProvider 包住 App */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
