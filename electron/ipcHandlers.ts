import { ipcMain } from "electron";
import xlsx from "xlsx";

let jsonData: any[] = [];
let headers: string[] = [];
let uniqueValuesObject: { [key: string]: any[] } = {};
let workbook: any;
let excelPath: string;

ipcMain.on("file-path", async (event, filePath) => {
  excelPath = filePath;
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

    const newWorksheet = xlsx.utils.json_to_sheet(filteredData);
    const sheetName = "Filtered Data";

    const ref = newWorksheet["!ref"];
    if (ref) {
      const range = xlsx.utils.decode_range(ref);
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        // Start at row 1 to skip header
        const cellAddress = xlsx.utils.encode_cell({ c: 2, r: row }); // Column C is index 2
        if (newWorksheet[cellAddress]) {
          newWorksheet[cellAddress].z = "mm/dd/yyyy"; // Set format as short date
        }
      }
    }

    if (!workbook.Sheets[sheetName]) {
      xlsx.utils.book_append_sheet(workbook, newWorksheet, sheetName);
    } else {
      workbook.Sheets[sheetName] = newWorksheet;
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
    event.reply("apply-sorter-reply", [true, "Sıralama uygulandı."]);
  } catch (error) {
    console.error("Error applying sorter:", error);
    event.reply("apply-sorter-reply", [false, "Sıralama uygulanamadı."]);
  }
});
