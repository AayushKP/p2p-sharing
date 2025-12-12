import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { WSProvider } from "./context/WebSocketContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WSProvider>
      <App />
    </WSProvider>
  </React.StrictMode>
);
