/**
 * @module
 */
const logger = require("../utils/logger");
let _sheetAccess;

/**
 * Set up this module with the object that allows access to the google sheet
 * calls. Typically from the value returned by sheetService.init(). When testing
 * a mocked object can be passed in. Only needs to be done once. 
 * @param {Object} sheetAccess optional  
 */
const init = (sheetAccess) => {
  _sheetAccess = sheetAccess;
};

/**
 * Set a range of data in a target sheet with an array of arrays of data
 * [[r1c1,r1c2],[r2c1,r2c2]]
 * if a sparse array is sent the missing cells in the range are skipped 
 * (i.e. they aren't overwritten)
 * @param {string} sheetId 
 * @param {string} range 
 * @param {Array} data 
 * @returns {Object} with config and data properties. config.data.values is the data sent
 * data{updatedRange, updatedRows, updatedColumns and updatedCells} can be used for testing 
 */
const setRangeData = async (sheetId, range, data) => {
  const resource = {
    values: data,
  };
  try {
    const result = await _sheetAccess.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      resource,
    });
    // logger.info(`${result.data.updatedCells} cells updated at range: ${result.data.updatedRange}`);
    return result; // only needed for testing
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Convenience function that will take a string or number primitive and wrap
 * it into a 2D array to write to the spreadsheet.
 * @param {string} spreadsheetId 
 * @param {string} cell range value that specifics a single cell
 * @param {string|number} newValue 
 */
const setSheetCell = async (spreadsheetId, cell, newValue) => {
  return await setRangeData(spreadsheetId, cell, [[newValue]]);
};
/**
 * Get all the cells in the specified range. If a given row has no data in the 
 * final cells for a row, the array for that row is shortened. If a row has no
 * data no array for that row is returned.
 * @param {string} spreadsheetId 
 * @param {string} range - includes the tab (aka sheet) name Sheet1:A2:C4 
 */
const getSheetValues = async (spreadsheetId, range) => {
  try {
    const result = await _sheetAccess.spreadsheets.values.get(
      {
        spreadsheetId,
        range,
      }
    );
    return result.data.values;
  } catch (err) {
    logger.error("Error trying to get range values\n", JSON.stringify(err));
  }
};


module.exports = {
  init,
  getSheetValues,
  setRangeData,
  setSheetCell,
};