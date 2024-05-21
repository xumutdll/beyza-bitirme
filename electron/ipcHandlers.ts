import { ipcMain } from "electron";

ipcMain.on("file-path", async (e, arg) => {
  console.log(arg);
});
