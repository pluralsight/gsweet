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

  const LB_FOLDER_ID = "1svR6YuJIfkfJZEDb9XTlt82s57Kagbxg";
  const READY_DB_ID = "17ztaxi-kM0RYk-XG3vUFKloExewpFLeM";
  const root = "root";


  const files = await driveOps.getFilesInFolder(root, driveOps.mimeType.FOLDER)
    .catch(error => {
      logger.debug(error);
    });
  // let names = files.map(e => e.name);
  logger.info(JSON.stringify(files.map(e => e.name)));
  logger.info("----------");

  const moreFiles = await driveOps.getFilesInFolder(LB_FOLDER_ID, driveOps.mimeType.FOLDER)
    .catch(error => {
      logger.debug(error);
    });
  logger.info(moreFiles.map(e => e.name));
  logger.info("----------");

  // const dbFiles = await driveOps.getFilesInFolderId(READY_DB_ID, driveOps.mimeType.FOLDER)
  //   .catch(error => {
  //     logger.debug(error);
  //   });
  // names = dbFiles.map(e => e.name);
  // logger.info(JSON.stringify(names));


  // await driveOps.countAllFiles()
  //   .catch(error => {
  //     logger.debug(error);
  //   });

};

main();