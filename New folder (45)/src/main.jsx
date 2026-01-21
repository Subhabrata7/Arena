import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/**
 * Tailwind:
 * If you're using Tailwind, ensure you have:
 * - src/index.css
 * - imported here
 *
 * If you haven't added Tailwind yet, you can keep this import,
 * and create src/index.css in Module 2.
 */
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
