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

    // grouper = [
    //   // {
    //   //   header: "BODY_TYPE",
    //   //   value: "REGULAR CARGO VAN",
    //   //   priority: "1",
    //   //   number: "10",
    //   // },
    //   // {
    //   //   header: "BODY_TYPE",
    //   //   value: "DOUBLE CAB IN VAN",
    //   //   priority: "1",
    //   //   number: "2",
    //   // },
    //   // { header: "BODY_TYPE", value: "CAMPER", priority: "1", number: "2" },
    //   // {
    //   //   header: "BODY_TYPE",
    //   //   value: "BUS M1 LRF",
    //   //   priority: "1",
    //   //   number: "4",
    //   // },
    //   {
    //     header: "SIDE_LOAD_DOOR",
    //     value: "RIGHT SIDE LOAD DOORS",
    //     priority: "1",
    //     number: "4",
    //   },
    //   {
    //     header: "SIDE_LOAD_DOOR",
    //     value: "DUAL SIDE LOAD DOORS",
    //     priority: "1",
    //     number: "4",
    //   },
    //   {
    //     header: "SIDE_LOAD_DOOR",
    //     value: "KERBSIDE SIDE LOAD DOORS",
    //     priority: "1",
    //     number: "1",
    //   },
    //   // {
    //   //   header: "SERIES_LENGTH",
    //   //   value: "ALL SHORT SERIES",
    //   //   priority: "2",
    //   //   number: "4",
    //   // },
    //   // {
    //   //   header: "SERIES_LENGTH",
    //   //   value: "ALL LONG SERIES",
    //   //   priority: "2",
    //   //   number: "4",
    //   // },
    // ];

    grouper = grouper.filter((group: any) => group.priority == 1);

    // grouper.sort(
    //   (a: any, b: any) => parseInt(a.priority) - parseInt(b.priority)
    // );
    // ----------------------------------------------------------------------------

    let dataByDatesArr: any[][] = uniqueValuesObject["Segmentation Date"].map(
      (date) => {
        return data.filter((item: any) => item["Segmentation Date"] === date);
      }
    );

    // grouper = transformData(grouper);
    // console.log(grouper);

    // // Label for the outer loop to facilitate breaking out of nested loops
    // for (let dayIndex = 0; dayIndex < dataByDatesArr.length; dayIndex++) {
    //   let dailyData = dataByDatesArr[dayIndex];
    //   groupLoop: for (
    //     let groupIndex = 0;
    //     groupIndex < grouper.length;
    //     groupIndex++
    //   ) {
    //     let g = grouper[groupIndex];
    //     let totalNum = 0; // Total items grouped for this configuration
    //     let arrNum = 0; // Index for the value and number arrays in grouper
    //     let num = 0; // Count for the current value being grouped

    //     for (let i = 0; i < dailyData.length; i++) {
    //       if (
    //         dailyData[i][g.header] === g.value[arrNum] &&
    //         totalNum < g.total
    //       ) {
    //         num++;
    //         totalNum++;
    //         if (num >= g.number[arrNum]) {
    //           arrNum = (arrNum + 1) % g.value.length; // Cycle through the values array
    //           num = 0; // Reset count for the next value
    //         }
    //         // Swap the current data to the start of the day's array to 'group' it
    //         let temp = dailyData[i];
    //         dailyData[i] = dailyData[totalNum - 1];
    //         dailyData[totalNum - 1] = temp;
    //       }
    //     }
    //     if (totalNum < g.total) {
    //       // Not enough data to fulfill the grouping requirement for this day
    //       continue groupLoop; // Skip to the next day or handle as needed
    //     }
    //   }
    // }

    function applyGrouping() {
      let result: any = [];

      dataByDatesArr.forEach((dailyData) => {
        let dayResult: any = [];
        let remainingData = [...dailyData]; // Make a copy of the daily data to track remaining items
        let cycles = true;

        while (cycles) {
          cycles = grouper.every((group: any) => {
            let groupCount = 0;
            // Attempt to form groups and track grouped items
            for (
              let i = 0;
              i < remainingData.length && groupCount < group.number;
              i++
            ) {
              if (remainingData[i][group.header] === group.value) {
                dayResult.push(remainingData[i]);
                groupCount++;
              }
            }

            // If we could not form a complete group, keep the items as is
            if (groupCount < group.number) {
              return false; // Stop cycling, can't form more complete groups
            } else {
              // Remove grouped items from remainingData
              remainingData = remainingData.filter(
                (item) =>
                  !(
                    item[group.header] === group.value &&
                    dayResult.includes(item)
                  )
              );
              return true; // Continue cycling
            }
          });

          // Add remaining items that weren't grouped this cycle
          if (!cycles) {
            dayResult.push(...remainingData);
            remainingData = []; // Clear remaining data since all have been added to the result
          }
        }

        result.push(dayResult);
      });

      return result;
    }

    let groupedData = applyGrouping();

    let flattenedData = groupedData.flat();

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
