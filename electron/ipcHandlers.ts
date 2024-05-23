import { ipcMain } from "electron";
import xlsx from "xlsx";

let jsonData: any[] = [];
let headers: string[] = [];
let uniqueValuesObject: { [key: string]: any[] } = {};
let workbook: any;
let excelPath: string;
let filteredJsonData: any[] = [];

const filteredSheetName = "Filtered Data";
const sortedSheetName = "Sorted Data";

ipcMain.on("file-path", async (event, filePath) => {
  excelPath = filePath;
  workbook = xlsx.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  jsonData = xlsx.utils.sheet_to_json(worksheet, {
    raw: false,
    dateNF: "yyyy-mm-dd",
  }) as any[];

  if (jsonData.length > 0) {
    headers = Object.keys(jsonData[0]);

    const uniqueValuesMap: { [key: string]: Set<any> } = {};
    headers.forEach((header) => {
      uniqueValuesMap[header] = new Set();
    });

    jsonData.forEach((item) => {
      headers.forEach((header) => {
        if (item[header]) {
          uniqueValuesMap[header].add(item[header]);
        }
      });
    });

    for (const [key, valueSet] of Object.entries(uniqueValuesMap)) {
      uniqueValuesObject[key] = Array.from(valueSet);
    }
  }
});

ipcMain.on("get-initial-data", (event) => {
  event.reply("get-initial-data-reply", uniqueValuesObject);
});

ipcMain.on("apply-filter", async (event, filter) => {
  try {
    const filteredData = jsonData.filter((item) => {
      return !filter.some((condition: any) => {
        if (Array.isArray(condition)) {
          return condition.every((cond) => item[cond.header] === cond.value);
        } else {
          return item[condition.header] === condition.value;
        }
      });
    });
    filteredJsonData = filteredData;

    const newWorksheet = xlsx.utils.json_to_sheet(filteredData);

    if (!workbook.Sheets[filteredSheetName]) {
      xlsx.utils.book_append_sheet(workbook, newWorksheet, filteredSheetName);
    } else {
      workbook.Sheets[filteredSheetName] = newWorksheet;
    }

    await xlsx.writeFile(workbook, excelPath); // Use the corrected path variable

    event.reply("apply-filter-reply", [true, "Filtre uygulandı."]);
  } catch (error) {
    console.error("Error applying filter:", error);
    event.reply("apply-filter-reply", [false, "Filtre uygulanamadı."]);
  }
});

ipcMain.on("apply-sorter", async (event, sorter) => {
  try {
    const data = workbook.SheetNames.includes(filteredSheetName)
      ? filteredJsonData
      : jsonData;

    // Sort the data based on the "Date" column
    data.sort((a: any, b: any) => {
      // Explicitly converting dates to timestamps for comparison
      const dateA = new Date(a["Date"]).getTime();
      const dateB = new Date(b["Date"]).getTime();
      return dateA - dateB; // For ascending order
    });

    const newWorksheet = xlsx.utils.json_to_sheet(data);

    if (!workbook.Sheets[filteredSheetName]) {
      xlsx.utils.book_append_sheet(workbook, newWorksheet, sortedSheetName);
    } else {
      workbook.Sheets[filteredSheetName] = newWorksheet;
    }

    await xlsx.writeFile(workbook, excelPath); // Use the corrected path variable

    event.reply("apply-sorter-reply", [true, "Sıralama uygulandı."]);
  } catch (error) {
    console.error("Error applying sorter:", error);
    event.reply("apply-sorter-reply", [false, "Sıralama uygulanamadı."]);
  }
});
