import { ipcMain } from "electron";
import xlsx from "xlsx";

let jsonData: any[] = [];
let headers: string[] = [];
let uniqueValuesObject: { [key: string]: any[] } = {};
let newWorkbook: any;
let excelPath: string;
let filteredJsonData: any[] = [];
let newFilePath: string = "";

const newExcelFileName = "Güncel Liste";
const filteredSheetName = "Filtered Data";
const groupedSheetName = "Sorted Data";

ipcMain.on("file-path", async (event, filePath) => {
  excelPath = filePath;
  const workbook = xlsx.readFile(excelPath, { type: "file" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  jsonData = xlsx.utils.sheet_to_json(worksheet, {
    raw: false,
    dateNF: "dd-mm-yyyy",
  }) as any[];

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

ipcMain.on("get-data-length", (event) => {
  event.reply("get-data-length-reply", jsonData.length);
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
  let data: any;

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

    grouper = [
      // {
      //   header: "BODY_TYPE",
      //   value: "REGULAR CARGO VAN",
      //   priority: "1",
      //   number: "10",
      // },
      // {
      //   header: "BODY_TYPE",
      //   value: "DOUBLE CAB IN VAN",
      //   priority: "1",
      //   number: "2",
      // },
      // { header: "BODY_TYPE", value: "CAMPER", priority: "1", number: "2" },
      // {
      //   header: "BODY_TYPE",
      //   value: "BUS M1 LRF",
      //   priority: "1",
      //   number: "4",
      // },
      // {
      //   header: "SIDE_LOAD_DOOR",
      //   value: "RIGHT SIDE LOAD DOORS",
      //   priority: "1",
      //   number: "4",
      // },
      // {
      //   header: "SIDE_LOAD_DOOR",
      //   value: "DUAL SIDE LOAD DOORS",
      //   priority: "1",
      //   number: "4",
      // },
      // {
      //   header: "SIDE_LOAD_DOOR",
      //   value: "KERBSIDE SIDE LOAD DOORS",
      //   priority: "1",
      //   number: "1",
      // },
      {
        header: "SERIES_LENGTH",
        value: "ALL SHORT SERIES",
        priority: "2",
        number: "5",
      },
      {
        header: "SERIES_LENGTH",
        value: "ALL LONG SERIES",
        priority: "2",
        number: "5",
      },
    ];

    grouper.sort(
      (a: any, b: any) => parseInt(a.priority) - parseInt(b.priority)
    );
    // ----------------------------------------------------------------------------

    let dataByDatesArr: any[][] = uniqueValuesObject["Segmentation Date"].map(
      (date) => {
        return data.filter((item: any) => item["Segmentation Date"] === date);
      }
    );

    // // let grouped: any = uniqueValuesObject["Segmentation Date"].map(() => ({}));

    // // dataByDatesArr.forEach((dailyData, dayIndex) => {
    // //   grouper.forEach((g: any) => {
    // //     if (g.priority == 1) {
    // //       let f = dailyData.filter((item) => item[g.header] === g.value);
    // //       grouped[dayIndex][g.value] = f;
    // //     }
    // //   });
    // // });
    // // console.log(grouped);

    grouper = transformData(grouper);
    console.log(grouper);
    let num = 0;
    let arrNum = 0;
    let totalNum = 0;

    dataByDatesArr.forEach((dailyData, dayIndex) => {
      grouper.forEach((g: any) => {
        // Her priority için bir döngü
        totalNum = 0;
        arrNum = 0;
        num = 0;
        for (let i = 0; i < dailyData.length; i++) {
          if (totalNum < g.total) {
            if (dailyData[i][g.header] === g.value[arrNum]) {
              // Found the expected value, increment counters
              num++;
              totalNum++;
              if (num >= g.number[arrNum]) {
                num = 0;
                arrNum++;
                if (arrNum >= g.value.length) {
                  // Reset for next cycle or exit if done
                  arrNum = 0;
                  num = 0;
                }
              }
            } else {
              // Search in the remaining array and swap if found
              let foundIndex = -1;
              for (let j = i + 1; j < dailyData.length; j++) {
                if (dailyData[j][g.header] === g.value[arrNum]) {
                  foundIndex = j;
                  break;
                }
              }
              if (foundIndex !== -1) {
                // Swap current item with found item
                const temp = dailyData[i];
                dailyData[i] = dailyData[foundIndex];
                dailyData[foundIndex] = temp;
                // Correctly increment num since we now have a matching item
                num++;
                totalNum++;
              } else {
                // There is no matching item, we gotta check other days.
                break;
              }
            }
          } else {
            totalNum = 0;
            arrNum = 0;
            num = 0;
          }
        }
      });
    });

    let flattenedData = dataByDatesArr.flat();

    // ----------------------------------------------------------------------------
    const newWorksheet = xlsx.utils.json_to_sheet(flattenedData);

    if (newWorkbook.SheetNames.includes(groupedSheetName)) {
      delete newWorkbook.Sheets[groupedSheetName];
    }

    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, groupedSheetName);
    await xlsx.writeFile(newWorkbook, newFilePath);

    event.reply("apply-grouping-reply", [true, "Sıralama uygulandı."]);
  } catch (error) {
    console.error("Error applying sorter:", error);
    event.reply("apply-grouping-reply", [false, "Sıralama uygulanamadı."]);
  }
});

// data.sort((a, b) => {  // It does sort automatically on filter idk how
//   const dateA = parseDate(a["Segmentation Date"]).getTime(); // Convert Date to timestamp
//   const dateB = parseDate(b["Segmentation Date"]).getTime(); // Convert Date to timestamp
//   return dateA - dateB; // Compare timestamps
// });

// function parseDate(dateStr: string) {
//   const [month, day, year] = dateStr.split("/").map(Number);
//   return new Date(year + 2000, month - 1, day);
// }

function transformData(data: any) {
  const result: any = [];

  data.forEach((item: any) => {
    const number = parseInt(item.number, 10);
    // Find if the item's header already exists in the result
    const existingGroup = result.find(
      (group: any) => group.header === item.header
    );
    if (existingGroup) {
      // If it exists, push to value and number arrays and update total
      existingGroup.value.push(item.value);
      existingGroup.number.push(number);
      existingGroup.total += number;
    } else {
      // Otherwise, create a new group entry with initial total
      result.push({
        header: item.header,
        priority: item.priority,
        value: [item.value],
        number: [number],
        total: number,
      });
    }
  });

  return result;
}
