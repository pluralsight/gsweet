// @ts-check
/** @module */
/**
 * @file Handles talking to the Google Drive API  
 * [GPL License Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 * 
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later
 * 
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
 * `[[r1c1,r1c2],[r2c1,r2c2]]`
 * if a sparse array is sent the missing cells in the range are skipped 
 * (i.e. they aren't overwritten)
 * @param {Object.<{id,range}>} sheetRange 
 * @param {Array.<Array>} data 
 * 
 * @returns {Promise<{config,data}>} object with many props including confif.data and data
 * ```
 * {  
 *   config: {
 *     ...
 *     data: {
 *       values: [[2D array of data sent]]
 *           }
 *     }...
 *   data: {
 *     ...
 *     updatedRange,   
 *     updatedRows,   
 *     updatedColumns,  
 *     updatedCells ,
 *     ...
 *   }
 * }
 * ```   
 * these properties can be useful for testing 
 */
const setRangeData = async (sheetRange, data) => {

  const resource = {
    values: data,
  };
  try {
    const result = await _sheetAccess.spreadsheets.values.update({
      spreadsheetId: sheetRange.id,
      range: sheetRange.range,
      valueInputOption: "USER_ENTERED",
      resource,
    });
    // logger.info(JSON.stringify(result, null, 2));
    return result; // only needed for testing
  } catch (err) {
    logger.error(err);
  }
};


/**
 * Convenience function that will take a string or number primitive and wrap
 * it into a 2D array to write to the spreadsheet.
 * @param {Object.<{id,range}>} sheetRange - where the range property should specify a single cell
 * @param {string|number} newValue  primitive value that gets put inside 2D array
 * 
 * @returns {Promise<Object>} see setRangeData for details on returned Object
 */
const setSheetCell = async (sheetRange, newValue) => await setRangeData(sheetRange, [[newValue]]);


/**
 * Get all the cells in the specified range. If a given row has no data in the 
 * final cells for a row, the array for that row is shortened. If a row has no
 * data no array for that row is returned.
 * @param {{id, range}} sheetRange  range property should include name of tab `Tab1!A2:C6`
 * 
 * @returns {Promise<Array.<Array>>} an array of rows containing an array for each column of data (even if only one column). 
 */
const getSheetValues = async (sheetRange) => {
  try {
    const result = await _sheetAccess.spreadsheets.values.get(
      {
        spreadsheetId: sheetRange.id,
        range: sheetRange.range,
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