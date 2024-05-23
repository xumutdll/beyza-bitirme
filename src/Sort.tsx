import React, { useState, useEffect, useRef } from "react";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";

import "./css/main.css";

const Sort: React.FC = () => {
  const hasSentIpc = useRef(false);
  const [headers, setHeaders] = useState<any[]>([]);
  const [uniqueValues, setUniqueValues] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [selectedHeader, setSelectedHeader] = useState(null);

  useEffect(() => {
    if (!hasSentIpc.current) {
      window.electron.ipcRenderer
        .send("get-initial-data")
        .then((response: any) => {
          const headerOptions = Object.keys(response).map((key) => ({
            label: key,
            value: key,
          }));
          setHeaders(headerOptions);
          setUniqueValues(response);
        });
      hasSentIpc.current = true;
    }
  }, []);

  const handleAddItemToList = (item: string) => {};

  return (
    <div className="h-full flex justify-content-center bg-secondary px-4 py-3 rounded shadow-board">
      <ListBox
        filter
        value={selectedHeader}
        options={headers}
        onChange={(e) => setSelectedHeader(e.value)}
        optionLabel="label"
        className="w-80 mr-4 bg-customWhite shadow-board"
        listStyle={{ maxHeight: "80vh" }}
      />
      <ListBox
        filter
        options={
          selectedHeader
            ? uniqueValues[selectedHeader].map((value) => ({
                label: value,
                value,
              }))
            : []
        }
        onChange={(e) => handleAddItemToList(e.value)}
        optionLabel="label"
        className="w-3/12 bg-customWhite shadow-board"
        listStyle={{ height: "80vh" }}
      />
      <div className="flex flex-col w-5/12 ml-auto">
        <div className="bg-customWhite vh80 shadow-board rounded">
          {/* <div className="bg-blurryWhite h-12 w-full"></div> */}
        </div>
        <Button className="flex items-center justify-center mt-auto shadow-btn bg-customBlack">
          Sıralamayı Uygula
        </Button>
      </div>
    </div>
  );
};

export default Sort;
