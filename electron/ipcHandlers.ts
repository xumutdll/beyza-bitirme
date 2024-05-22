import { ipcMain } from "electron";
import xlsx from "xlsx";

let jsonData: any[] = [];
let headers: string[] = [];
let uniqueValuesObject: { [key: string]: any[] } = {};
let workbook: any;
let path: string;

ipcMain.on("file-path", async (event, path) => {
  path = path;
  workbook = xlsx.readFile(path);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  jsonData = xlsx.utils.sheet_to_json(worksheet) as any[];

  if (jsonData.length > 0) {
    headers = Object.keys(jsonData[0]);

    // Create an object to store unique values for each header
    const uniqueValuesMap: { [key: string]: Set<any> } = {};

    // Initialize a Set for each header
    headers.forEach((header) => {
      uniqueValuesMap[header] = new Set();
    });

    // Populate the Set for each header with unique values from the data
    jsonData.forEach((item) => {
      headers.forEach((header) => {
        if (item[header]) {
          // Skip empty values if not needed
          uniqueValuesMap[header].add(item[header]);
        }
      });
    });

    // Convert Sets to arrays and log the result
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
    // Use 'some' to apply 'OR' logic for exclusion
    return !filter.some((condition: any) => {
      if (Array.isArray(condition)) {
        // Use 'every' to apply 'AND' logic within a sub-array
        return condition.every((cond) => item[cond.header] === cond.value);
      } else {
        // Direct condition comparison for exclusion
        return item[condition.header] === condition.value;
      }
    });
  });

  // event.reply("apply-filter-reply", filteredData);
});
