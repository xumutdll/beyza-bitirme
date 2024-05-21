import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Import from "./Import";
import Filter from "./Filter";
import Sort from "./Sort";

import "./css/main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route index element={<Import />} />
        <Route path="/Filter" element={<Filter />} />
        <Route path="/Sort" element={<Sort />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
