import React, { useState, useEffect, useRef } from "react";
import { ListBox } from "primereact/listbox";

const Filter: React.FC = () => {
  const hasSentIpc = useRef(false);
  const [headers, setHeaders] = useState<any[]>([]);
  const [uniqueValues, setUniqueValues] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);

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

  const handleHeaderChange = (e: any) => {
    setSelectedHeader(e.value);
    setSelectedValue(null); // Reset selected value when header changes
  };

  return (
    <div className="h-full">
      <div className="card flex justify-content-center">
        <ListBox
          filter
          value={selectedHeader}
          options={headers}
          onChange={handleHeaderChange}
          optionLabel="label"
          className="w-fit mr-6"
          listStyle={{ height: "80vh" }}
        />
        <ListBox
          filter
          value={selectedValue}
          options={
            selectedHeader
              ? uniqueValues[selectedHeader].map((value) => ({
                  label: value,
                  value,
                }))
              : []
          }
          onChange={(e) => setSelectedValue(e.value)}
          optionLabel="label"
          className="w-3/12"
          listStyle={{ height: "80vh" }}
        />
      </div>
    </div>
  );
};

export default Filter;
