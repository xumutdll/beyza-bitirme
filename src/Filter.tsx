import React, { useState, useEffect, useRef } from "react";

import { ListBox } from "primereact/listbox";

const Filter: React.FC = () => {
  const hasSentIpc = useRef(false);
  const [headers, setHeaders] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    if (!hasSentIpc.current) {
      window.electron.ipcRenderer.send("get-initial-data").then((data: any) => {
        console.log(data);
        // setHeaders(data);
      });
      hasSentIpc.current = true;
    }
  }, []);

  const groupedCities = [
    {
      label: "Germany",
      code: "DE",
      items: [
        { label: "Berlin", value: "Berlin" },
        { label: "Frankfurt", value: "Frankfurt" },
        { label: "Hamburg", value: "Hamburg" },
        { label: "Munich", value: "Munich" },
      ],
    },
    {
      label: "USA",
      code: "US",
      items: [
        { label: "Chicago", value: "Chicago" },
        { label: "Los Angeles", value: "Los Angeles" },
        { label: "New York", value: "New York" },
        { label: "San Francisco", value: "San Francisco" },
      ],
    },
    {
      label: "Japan",
      code: "JP",
      items: [
        { label: "Kyoto", value: "Kyoto" },
        { label: "Osaka", value: "Osaka" },
        { label: "Tokyo", value: "Tokyo" },
        { label: "Yokohama", value: "Yokohama" },
      ],
    },
  ];

  const groupTemplate = (option: any) => {
    return (
      <div className="flex align-items-center gap-2 ">
        <div>{option.label}</div>
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="card flex justify-content-center">
        <ListBox
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.value)}
          options={groupedCities}
          optionLabel="label"
          optionGroupLabel="label"
          optionGroupChildren="items"
          optionGroupTemplate={groupTemplate}
          className="bg-white text-black"
          filter
        />
      </div>
    </div>
  );
};

export default Filter;
