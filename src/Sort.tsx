import React, { useState, useEffect, useRef } from "react";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";

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
    <div className="h-full flex justify-content-center bg-secondary px-4 py-3 rounded-md shadow-board">
      <ListBox
        filter
        value={selectedHeader}
        options={headers}
        onChange={(e) => setSelectedHeader(e.value)}
        optionLabel="label"
        className="w-80 mr-4 bg-customWhite"
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
        className="w-3/12 bg-customWhite"
        listStyle={{ height: "80vh" }}
      />
      <div className="bg-primary w-5/12 ml-auto"></div>
    </div>
  );
};

export default Sort;
