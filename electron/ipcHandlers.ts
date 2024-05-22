import { ipcMain } from "electron";
import xlsx from "xlsx";

let jsonData: any[] = [];
let headers: string[] = [];
let uniqueValuesObject: { [key: string]: any[] } = {};
let workbook: any;
let excelPath: string; // Renamed for clarity

ipcMain.on("file-path", async (event, filePath) => {
  excelPath = filePath; // Use a different variable name for the parameter to avoid shadowing
  workbook = xlsx.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  jsonData = xlsx.utils.sheet_to_json(worksheet) as any[];

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

ipcMain.on("apply-filter", (event, filter) => {
  const filteredData = jsonData.filter((item) => {
    return !filter.some((condition: any) => {
      if (Array.isArray(condition)) {
        return condition.every((cond) => item[cond.header] === cond.value);
      } else {
        return item[condition.header] === condition.value;
      }
    });
  });

  const newWorksheet = xlsx.utils.json_to_sheet(filteredData);
  const sheetName = "Filtered Data";

  if (!workbook.Sheets[sheetName]) {
    xlsx.utils.book_append_sheet(workbook, newWorksheet, sheetName);
  } else {
    workbook.Sheets[sheetName] = newWorksheet;
  }

  xlsx.writeFile(workbook, excelPath); // Use the corrected path variable
});
