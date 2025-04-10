import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { initializeTargetUrl } from "./services/targetUrl";
import App from "./App";

// require('string-direction').patch();

initializeTargetUrl();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
