import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";

const Panel: React.FC = () => {
  const [dataLength, setDataLength] = useState(0);
  const hasSentIpc = useRef(false);

  useEffect(() => {
    if (!hasSentIpc.current) {
      window.electron.ipcRenderer
        .send("get-data-length")
        .then((response: number) => {
          setDataLength(response);
        });
      hasSentIpc.current = true;
    }
  }, []);

  return (
    <div className="grid grid-rows-[auto_1fr] px-3 select-none relative">
      <div className="mt-1 mb-2 flex">
        <NavLink
          end
          to="/"
          className="w-3/12 text-center py-2 rounded-md shadow-btnBar bg-customWhite"
        >
          Yeni Dosya
        </NavLink>

        <NavLink
          end
          to="/panel"
          className={({ isActive }) =>
            `w-3/12 text-center py-2 rounded-md shadow-btnBar ml-auto ${
              isActive ? "bg-tertiary" : "bg-secondary"
            }`
          }
        >
          Filtrele
        </NavLink>

        <NavLink
          to="/panel/sort"
          className={({ isActive }) =>
            `w-3/12 text-center py-2 rounded-md shadow-btnBar ${
              isActive ? "bg-tertiary" : "bg-secondary"
            }`
          }
        >
          Sırala
        </NavLink>
      </div>
      <Outlet />
      <div className="absolute bottom-0 -mb-4 ml-5 text-xs">
        Okunan satır sayısı: {dataLength}
      </div>
    </div>
  );
};

export default Panel;
