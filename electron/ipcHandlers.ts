import { ipcMain } from "electron";
import xlsx from "xlsx";

let jsonData: any[] = [];
let headers: string[] = [];
let uniqueValuesObject: { [key: string]: any[] } = {};
let newWorkbook: any;
let excelPath: string;
let filteredJsonData: any[] = [];
let newFilePath: string = "";

const newExcelFileName = "Edited";
const filteredSheetName = "Filtered Data";
const groupedSheetName = "Sorted Data";

ipcMain.on("file-path", async (event, filePath) => {
  excelPath = filePath;
  const workbook = xlsx.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: true }) as any[];

  if (jsonData.length > 0) {
    headers = Object.keys(jsonData[0]);

    const uniqueValuesMap: { [key: string]: Set<any> } = {};

    headers.forEach((header) => {
      uniqueValuesMap[header] = new Set();
    });

    jsonData.forEach((item) => {
      headers.forEach((header) => {
        uniqueValuesMap[header].add(item[header]);
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
    filteredJsonData = jsonData.filter((item) => {
      return !filter.some((condition: any) => {
        if (Array.isArray(condition)) {
          return condition.every((cond) => item[cond.header] === cond.value);
        } else {
          return item[condition.header] === condition.value;
        }
      });
    });

    const newWorksheet = xlsx.utils.json_to_sheet(filteredJsonData);
    newWorkbook = xlsx.utils.book_new();
    newFilePath =
      excelPath.substring(0, excelPath.lastIndexOf("\\")) +
      "\\" +
      newExcelFileName +
      ".xlsx";

    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, filteredSheetName);
    await xlsx.writeFile(newWorkbook, newFilePath);

    // ------------ This writes the same wordbook!
    // if (!workbook.Sheets[filteredSheetName]) {
    //   xlsx.utils.book_append_sheet(workbook, newWorksheet, filteredSheetName);
    // } else {
    //   workbook.Sheets[filteredSheetName] = newWorksheet;
    // }

    // await xlsx.writeFile(workbook, excelPath);
    // --------------------

    event.reply("apply-filter-reply", [true, "Filtre uygulandı."]);
  } catch (error) {
    console.error("Error applying filter:", error);
    event.reply("apply-filter-reply", [false, "Filtre uygulanamadı."]);
  }
});

ipcMain.on("apply-grouping", async (event, grouper) => {
  let data;

  try {
    if (newFilePath === "") {
      data = jsonData; // No filter applied in this session, continue with unfiltered excel data
      newFilePath =
        excelPath.substring(0, excelPath.lastIndexOf("\\")) +
        "\\" +
        newExcelFileName +
        ".xlsx"; // Since no filter applied, this variable is empty, so we create a new file path
      newWorkbook = xlsx.utils.book_new(); // Also there is no workbook, so we create a new one
    } else {
      data = filteredJsonData; // Filter applied in this session, continue with filtered excel data
    }

    grouper.sort(
      (a: any, b: any) => parseInt(b.priority) - parseInt(a.priority)
    );

    console.log(grouper);

    // Here we apply our grouper to data.

    const newWorksheet = xlsx.utils.json_to_sheet(data);

    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, groupedSheetName);
    await xlsx.writeFile(newWorkbook, newFilePath);

    event.reply("apply-grouping-reply", [true, "Sıralama uygulandı."]);
  } catch (error) {
    console.error("Error applying sorter:", error);
    event.reply("apply-grouping-reply", [false, "Sıralama uygulanamadı."]);
  }
});
