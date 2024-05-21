import { ipcMain } from "electron";
import xlsx from "xlsx";
import { writeFile } from "fs";

let jsonData: any[] = [];
let headers: string[] = [];
let uniqueValuesObject: { [key: string]: any[] } = {};

ipcMain.on("file-path", async (e, path) => {
  const workbook = xlsx.readFile(path);
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
    //   const jsonString = JSON.stringify(jsonData, null, 2); // null, 2 for pretty-printing

    //   writeFile("output.json", jsonString, (err) => {
    //     if (err) {
    //       console.error("Failed to save JSON data:", err);
    //     } else {
    //       console.log("JSON data saved successfully to output.json");
    //     }
    //   });
  }
});

ipcMain.on("get-initial-data", (event) => {
  event.reply("get-initial-data-reply", uniqueValuesObject);
});
