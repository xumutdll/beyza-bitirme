import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Panel from "./Panel";
import Import from "./Import";
import Filter from "./Filter";
import Sort from "./Sort";
import "primereact/resources/themes/saga-blue/theme.css"; // Theme CSS
// import "primereact/resources/primereact.min.css"; // Core CSS

import "./css/main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route index element={<Import />} />
        <Route path="/panel" element={<Panel />}>
          <Route index element={<Filter />} />
          <Route path="/panel/sort" element={<Sort />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
