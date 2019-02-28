const ss = require("./sheetService");
const sheetOps = require("./sheetOps");

const sampleSpreadsheetId = "1UYSrzhP0hNYViJITcMuU5FY_CUhPxkGEEHfE59_meM8";

const main = async () => {
  console.log("Hello World.");
  const sheetService = ss.init();
  sheetOps.init(sheetService);
  const values = await sheetOps.getSheetValues(sampleSpreadsheetId, "Learning Blueprint!P2:P67");
  console.log(values);
};

main();