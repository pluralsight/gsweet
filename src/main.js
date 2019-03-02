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
  // const values = await sheetOps.getSheetValues(sampleSpreadsheetId, "Learning Blueprint!P2:P67");
  // logger.info(JSON.stringify(values));

  const driveService = ds.init();
  driveOps.init(driveService);

  // const id = await driveOps.getFileIdFromName("Courses to be Retired");
  // logger.info(id);
  // const fileList = await driveOps.listFiles();
  // logger.info(JSON.stringify(fileList));


  const LB_FOLDER_ID = "1svR6YuJIfkfJZEDb9XTlt82s57Kagbxg";
  // const folderFiles = await driveOps.getSubFoldersInFolderId(LB_FOLDER_ID)
  //   .catch(error => {console.log(error);});

  // logger.info(folderFiles);
  // console.log(folderFiles);

  const moreFiles = await driveOps.getFilesInFolderId(LB_FOLDER_ID, driveOps.mimeType.FOLDER);
  logger.info(JSON.stringify(moreFiles));
  logger.info("----------");

  const children = await driveOps.getChildren(LB_FOLDER_ID);
  logger.info(JSON.stringify(children));



};

main();