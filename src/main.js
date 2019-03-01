const logger = require("./utils/logger");
const ss = require("./Sheets/sheetService");
const sheetOps = require("./Sheets/sheetOps");
const ds = require("./Drive/driveService");
const driveOps = require("./Drive/driveOps");


const sampleSpreadsheetId = "1UYSrzhP0hNYViJITcMuU5FY_CUhPxkGEEHfE59_meM8";

const main = async () => {
  logger.silly("Hello World.");
  const sheetService = ss.init();
  sheetOps.init(sheetService);
  const values = await sheetOps.getSheetValues(sampleSpreadsheetId, "Learning Blueprint!P2:P67");
  logger.info(JSON.stringify(values));

  const driveService = ds.init();
  driveOps.init(driveService);

  const id = await driveOps.driveGetFileIdFromName("Courses to be Retired");
  logger.info(id);
};

main();