import React, { useState, useEffect, useRef } from "react";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const Filter: React.FC = () => {
  const navigate = useNavigate();
  const hasSentIpc = useRef(false);
  const [headers, setHeaders] = useState<any[]>([]);
  const [uniqueValues, setUniqueValues] = useState<{ [key: string]: any[] }>(
    {}
  );
  const [selectedHeader, setSelectedHeader] = useState(null);
  const [filterType, setFilterType] = useState(true); // true is 'or' false is 'and'
  const [filter, setFilter] = useState<any[]>([]);

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

  const handleAddFilter = (item: string) => {
    const filterItem = { header: selectedHeader, value: item };

    if (filterType) {
      // 'OR' logic: Add directly to the filter array
      setFilter([...filter, filterItem]);
    } else {
      // 'AND' logic: Add as a group or to the last group
      const lastElement = filter[filter.length - 1];
      if (Array.isArray(lastElement) && !filterType) {
        // Add to the existing group
        lastElement.push(filterItem);
        setFilter([...filter.slice(0, -1), lastElement]);
      } else {
        // Start a new group
        setFilter([...filter, [filterItem]]);
      }
    }
  };

  const displayFilters = filter.map((item) =>
    Array.isArray(item)
      ? item.map((subItem) => subItem.value).join(" & ")
      : item.value
  );

  const handleRemoveFilter = (itemToRemove: string) => {
    setFilter(
      filter.filter((item) => {
        if (Array.isArray(item)) {
          // For arrays, join their 'value' fields with ' & ' and compare to the itemToRemove
          const joinedValues = item.map((subItem) => subItem.value).join(" & ");
          return joinedValues !== itemToRemove;
        } else {
          // For single items, compare their 'value' field directly
          return item.value !== itemToRemove;
        }
      })
    );
  };

  const handleApplyFilter = () => {
    window.electron.ipcRenderer.send("apply-filter", filter);

    navigate("/panel/sort");
  };

  useEffect(() => {
    console.log(filter);
  }, [filter]);

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
        onChange={(e) => handleAddFilter(e.value)}
        optionLabel="label"
        className="w-3/12 bg-customWhite shadow-board"
        listStyle={{ height: "80vh" }}
      />

      <Button
        className="mx-auto mt-44 w-32 h-12 flex items-center justify-center "
        onClick={() => setFilterType(!filterType)}
      >
        {filterType ? "Veya" : "Ve"}
      </Button>
      <div className="flex flex-col w-3/12">
        <ListBox
          options={displayFilters.map((filter) => ({
            label: filter,
            value: filter,
          }))}
          onChange={(e) => handleRemoveFilter(e.value)}
          optionLabel="label"
          className="bg-customWhite shadow-board"
          listStyle={{
            height: "80vh",
          }}
        />

        <Button
          onClick={handleApplyFilter}
          className="flex items-center justify-center mt-auto shadow-btn bg-customBlack"
        >
          Filtreyi Uygula
        </Button>
      </div>
    </div>
  );
};

export default Filter;
