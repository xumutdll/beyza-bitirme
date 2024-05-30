import React, { useState, useEffect, useRef } from "react";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import Swal from "sweetalert2";
import { useOutletContext } from "react-router-dom";

import "./css/main.css";

const Sort: React.FC = () => {
  const hasSentIpc = useRef(false);
  const [headers, setHeaders] = useState<any[]>([]);
  const [uniqueValues, setUniqueValues] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [selectedHeader, setSelectedHeader] = useState(null);

  const { sorter, setSorter } = useOutletContext<PanelContextType>();

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
    // Check if the item is already in the sorter
    const isAlreadyAdded = sorter.some(
      (sortItem) =>
        sortItem.header === selectedHeader && sortItem.value === item
    );

    if (!isAlreadyAdded) {
      // Only add the item if it's not already added
      setSorter([
        ...sorter,
        { header: selectedHeader, value: item, priority: "", number: "" },
      ]);
    } else {
      // Optional: Alert the user or handle the case when item is already added
      console.log("Item already added.");
    }
  };

  const handleRemoveItemFromSorter = (itemToRemove: string) => {
    const newSorter = sorter.filter(
      (sortItem) => sortItem.value !== itemToRemove
    );
    setSorter(newSorter);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    if (/^\d*$/.test(value)) {
      // Allows only digits
      const newSorter = [...sorter];
      newSorter[index][field] = value;
      setSorter(newSorter);
    }
  };

  const handleApplySorter = async () => {
    // Check if all items in the sorter have both 'priority' and 'number' fields filled
    const allFieldsFilled = sorter.every(
      (item) => item.priority && item.number
    );

    if (allFieldsFilled) {
      const reply = await window.electron.ipcRenderer.send(
        "apply-grouping",
        sorter
      );
      if (reply[0]) {
        Swal.fire({
          title: "Başarılı",
          text: reply[1],
          icon: "success",
          confirmButtonText: "Tamam",
        });
      } else {
        Swal.fire({
          title: "Beklenmedik bir hata ile karşılaşıldı.",
          text: reply[1],
          icon: "error",
          confirmButtonText: "Tamam",
        });
      }
    } else {
      Swal.fire({
        title: "Tamamlanmamış alanlar",
        text: "Tüm 'Öncelik' ve 'Adet' alanları doldurulmadan sıralama uygulanamaz.",
        icon: "warning",
        confirmButtonText: "Tamam",
      });
    }
  };

  const itemTemplate = (option: any) => {
    return (
      <div className="min-h-fit p-0 m-0 font-medium flex items-center">
        {option.label}
      </div>
    );
  };

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
              className="flex items-center bg-blurryWhite h-12 w-full text-primary font-medium px-4 my-2"
            >
              <div
                className="w-full h-full flex items-center mr-1"
                onClick={() => handleRemoveItemFromSorter(item.value)}
              >
                {item.header} {"-->"} {item.value}
              </div>
              <div className="ml-auto flex">
                <InputText
                  type="text"
                  className="p-inputtext-sm w-16 mr-2"
                  placeholder="Öncelik"
                  value={item.priority}
                  onChange={(e) =>
                    handleInputChange(index, "priority", e.target.value)
                  }
                />
                <InputText
                  type="text"
                  className="p-inputtext-sm w-16"
                  placeholder="Adet"
                  value={item.number}
                  onChange={(e) =>
                    handleInputChange(index, "number", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={handleApplySorter}
          className="flex items-center justify-center mt-auto shadow-btn bg-customBlack"
        >
          Sıralamayı Uygula
        </Button>
      </div>
    </div>
  );
};

export default Sort;
