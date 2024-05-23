import React, { useState, useEffect, useRef } from "react";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import "./css/main.css";

const Sort: React.FC = () => {
  const hasSentIpc = useRef(false);
  const [headers, setHeaders] = useState<any[]>([]);
  const [uniqueValues, setUniqueValues] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [sorter, setSorter] = useState<any[]>([]);

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

  const handleAddItemToSorter = (item: string) => {
    setSorter([...sorter, { header: selectedHeader, value: item }]);
  };

  const handleRemoveItemFromSorter = (itemToRemove: string) => {
    const newSorter = sorter.filter(
      (sortItem) => sortItem.value !== itemToRemove
    );
    setSorter(newSorter);
  };

  const itemTemplate = (option: any) => {
    return (
      <div className="min-h-fit p-0 m-0 font-medium flex items-center">
        {option.label}
      </div>
    );
  };

  useEffect(() => {
    console.log(sorter);
  }, [sorter]);

  return (
    <div className="h-full flex justify-content-center bg-secondary px-4 py-3 rounded shadow-board">
      <ListBox
        filter
        value={selectedHeader}
        options={headers}
        onChange={(e) => setSelectedHeader(e.value)}
        optionLabel="label"
        className="minW350 mr-4 bg-customWhite shadow-board"
        listStyle={{ height: "80vh" }}
        itemTemplate={itemTemplate}
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
        onChange={(e) => handleAddItemToSorter(e.value)}
        optionLabel="label"
        className="w-3/12 bg-customWhite shadow-board"
        listStyle={{ height: "80vh" }}
        itemTemplate={itemTemplate}
      />
      <div className="flex flex-col w-5/12 ml-auto">
        <div className="bg-customWhite vh80 shadow-board rounded">
          {sorter.map((item, index) => (
            <div
              key={index}
              className={`flex items-center bg-blurryWhite h-12 w-full text-primary font-medium px-4 mb-2 ${
                index === 0 && "rounded-t"
              }`}
            >
              <div onClick={() => handleRemoveItemFromSorter(item.value)}>
                {item.header} {"-->"} {item.value}
              </div>
              <div className="ml-auto flex">
                <InputText
                  type="text"
                  className="p-inputtext-sm w-16 mr-2"
                  placeholder="Öncelik"
                />
                <InputText
                  type="text"
                  className="p-inputtext-sm w-16"
                  placeholder="Adet"
                />
              </div>
            </div>
          ))}
        </div>
        <Button className="flex items-center justify-center mt-auto shadow-btn bg-customBlack">
          Sıralamayı Uygula
        </Button>
      </div>
    </div>
  );
};

export default Sort;
