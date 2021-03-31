// @ts-check
/**
 * @file Handles talking to the Google Drive API
 * [GPL License Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 *
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later
 * @module sheetOps
 */
const ss = require('./sheetService')
const logger = require('../utils/logger')
const sheetFormat = require('./sheetFormatOps') // TODO refactor out the batch stuff to its own class

let _sheetService

/**
 * Set up this module with the object that allows access to the google sheet
 * calls. Typically from the value returned by sheetService.init(). When testing
 * a mocked object can be passed in. Only needs to be done once.
 * @param {Object} sheetService optional
 */
const init = sheetService => {
  _sheetService = sheetService
}

/** just get the default service and use it */
const autoInit = () => {
  _sheetService = ss.init()
}

/**
 * @typedef IdRangeType
 * @property {string} id
 * @property {string} range
 */

/**
 * @typedef IdRangeDataType
 * @property {string} id
 * @property {string} range
 * @property {[][]} data
 */

/**
 * @typedef IdRangeValueType
 * @property {string} id
 * @property {string} range
 * @property {any} value
 */


/**
 * Set a range of data in a target sheet with an array of arrays of data
 * By default each inner array is a row in the sheet with an element for each column
 * if a sparse array is sent the missing cells in the range are skipped
 * (i.e. they aren't overwritten)
 * @param {IdRangeDataType} sheetRangeData
 * @returns {Promise<{config:{data:{values:[][]}},
 * data:{spreadsheetId:string,updatedRange:string,updatedRows:number,updatedColumns:number, updatedCells:number}}>}
 * object with many props including config.data and data
 * ```
 * {
 *   config: {
 * ...
 *     data: {
 *       values: [[2D array of data sent]]
 *           }
 * ...
 *     },
 *   data: {
 *     spreadsheetId,
 *     updatedRange,
 *     updatedRows,
 *     updatedColumns,
 *     updatedCells ,
 *   }
 * headers:{...}
 * status:number
 * statusText:string
 * }
 *```
 * these properties can be useful for testing
 * @example setRangeData({id:"longgoogleid",range:"Sheet1!A1", data:[["R1C1","R1C2"],["R2C1","R2C2"]]})
 */
const setRangeData = async sheetRangeData => {
  const resource = {
    values: sheetRangeData.data,
  }
  try {
    const result = await _sheetService.spreadsheets.values.update({
      spreadsheetId: sheetRangeData.id,
      range: sheetRangeData.range,
      valueInputOption: 'USER_ENTERED',
      resource,
    })
    // logger.info(JSON.stringify(result, null, 2));
    return result // only needed for testing
  } catch (err) {
    // logger.error(JSON.stringify(err, null, 2))
    throw err
  }
}

/**
 * Convenience function that will take a string or number primitive and wrap
 * it into a 2D array to write to the spreadsheet.
 * @param {IdRangeValueType} sheetRangeValue - where the range property should specify a single cell
 * @returns {Promise<Object>} see setRangeData for details on returned Object
 * @example setSheetCell({id:SHEET_ID, range:Tab!A1, value:"SomeValue"})
 */
const setSheetCell = async sheetRangeValue => {
  sheetRangeValue['data'] = [[sheetRangeValue.value]]
  // @ts-ignore
  return await setRangeData(sheetRangeValue)
}

/**
 * Get all the cells in the specified range. If a given row has no data in the
 * final cells for a row, the array for that row is shortened. If a row has no
 * data no array for that row is returned.
 * @param {IdRangeType} sheetRange  range property should include name of tab `Tab1!A2:C6`
 * @returns {Promise<Array.<Array<number|string>>>} an array of rows containing an array for each column of data (even if only one column).
 * @example getSheetValues({id:SOME_ID, range:TabName!A:I})
 */
const getSheetValues = async sheetRange => {
  try {
    const result = await _sheetService.spreadsheets.values.get({
      spreadsheetId: sheetRange.id,
      range: sheetRange.range,
    })
    return result.data.values
  } catch (err) {
    const msg = `${err.response.data.error.message}`
    // logger.error(`GSWEET Package: sheetOps.js`)
    // logger.error(msg)
    throw msg
  }
}

/**
 *
 * @param {string} sheetId
 */
const getSheetProperties = async sheetId => {
  try {
    const result = await _sheetService.spreadsheets.get({
      spreadsheetId: sheetId,
      includeGridData: false,
    })
    return result
  } catch (err) {
    logger.error(err)
  }
}

const getSheetTitle = async sheetId => {
  const result = await getSheetProperties(sheetId)
  const {title} = result.data.properties
  return title
}

/**
 * @typedef {object} SheetIndexName
 *  @property  {string} sheetId
 *  @property  {number?} sheetIndex
 *  @property  {string?} sheetName
 */

/**
 * @typedef {object} gridProperties
 * @property {boolean} isValid
 * @property {number} rowCount
 * @property {number} columnCount
 * @property {string} message  
 */


/**
 * Get the grid properties which is an object with a rowCount and columnCount
 * property. 
 * @param {SheetIndexName} sheetInfo
 * @returns {Promise<gridProperties>}
 */
const getSheetGridProperties = async sheetInfo => {
  const {sheetId} = sheetInfo
  const result = await getSheetProperties(sheetId)
  const {sheets} = result.data
  const {sheetIndex, sheetName} = sheetInfo
  // The full properties includes properties for title, gridProperties, and tabColor
  // The tabColor has properties for red, green, and blue (0->1)
  // we're only after the rowCount and ColumnCount properties on gridProperties
  if (sheetInfo.sheetIndex !== undefined) {
    return getGridPropertiesByIndex({sheetIndex, sheets})
  }
  return getGridPropertiesByName({sheetName, sheets})
}

/**
 * Find a sheet by name on a spreadsheet and return the sheet and status
 * of it if was found.
 * @param {{spreadsheetId: string, sheetName:string }} sheetInfo 
 * @returns {Promise<IsValidSheet>}
 */
const getSheetByName = async sheetInfo => {
  const {spreadsheetId, sheetName} = sheetInfo
  const result = await getSheetProperties(spreadsheetId)
  const {sheets} = result.data
  return getSheetByNameFromSheets({sheetName, sheets})
}
/**
 * @typedef {object} SheetNameSheets
 *  @property  {string} sheetName
 *  @property {object} sheets
}} 
 */

/**
 * @private
 * @param {SheetNameSheets} param0 
 * @returns {gridProperties}
 */
const getGridPropertiesByName = ({sheetName, sheets}) => {
  const result = {isValid:true,
    message:'',
    rowCount:0,
    columnCount:0,
  } 

  const {isValid, sheet} = getSheetByNameFromSheets({sheetName, sheets})
  if (isValid) {
    const gp = sheet.properties.gridProperties
    result.rowCount = gp.rowCount
    result.columnCount = gp.columnCount 
    return result
  }
  result.isValid = false
  result.message = 'Error: request for sheet name that does not exist'
  return result
}

/**
 * @typedef {object} IsValidSheet
 *  @property {boolean} isValid 
 *  @property {any} sheet 
 */

/**
 * @param {SheetNameSheets} param0 
 * @returns {IsValidSheet}
 */
const getSheetByNameFromSheets = ({sheetName, sheets}) => {
  for (const sheet of sheets) {
    const {properties} = sheet
    if (properties.title === sheetName) {
      return {isValid:true, sheet}
    }
  }
  return {isValid:false, sheet:null}
}

/** 
 * From the id passed for the SPREADSHEET, find the id of the Sheet (aka tab) with the passed name.
 * Note that this returns the ID not the index, although often the id of the first sheet is often 0 
 * the other sheets have longer ids
 * @param {{sheetId:string, sheetName:string}} sheetInfo 
 * @returns {Promise<{isValid:boolean, sheetId:string}>}
*/
const getSheetIdByName = async sheetInfo => {
  const {sheetId, sheetName} = sheetInfo
  const result = await getSheetProperties(sheetId)
  const {sheets} = result.data
  return  extractSheetId({sheetName, sheets})
}


const extractSheetId = ({sheetName, sheets}) => {
  const result = {isValid:false,
    sheetId:'-1',
  } 
  for (const sheet of sheets) {
    const {properties} = sheet
    if (properties.title === sheetName) {
      result.isValid = true
      result.sheetId = properties.sheetId
      return result
    }
  }
  return result
}

/**
 * @private
 * @param {object} obj
 * @param {number} obj.sheetIndex
 * @param {object} obj.sheets
 * @returns {gridProperties}
 */
const getGridPropertiesByIndex = ({sheetIndex, sheets}) => {
  const result = {isValid:false,
    message:'',
    rowCount:0,
    columnCount:0,
  }   
  if (sheets.length > sheetIndex) {
    const gp = sheets[sheetIndex].properties.gridProperties
    result.isValid = true
    result.rowCount = gp.rowCount
    result.columnCount = gp.columnCount
    return result
  }
  result.message = 'Error: request for sheetIndex that does not exist'
  return  result
}

/**
 * 
 * @param {{fromSpreadsheetId:string, fromSheetName:string, toSpreadsheetId:string}} param0 
 */
const  copySheetByNameFromTo = async({fromSpreadsheetId, fromSheetName, toSpreadsheetId}) => {
  const foundSheet = await getSheetIdByName({sheetId:fromSpreadsheetId, sheetName:fromSheetName})
  if (!foundSheet.isValid) {
    return {success:false, message:`Could not find destination sheet with name ${fromSheetName}`, sheetInfo:null}
  }

  return copySheetFromTo({fromSpreadsheetId, fromSheetId:foundSheet.sheetId, toSpreadsheetId})
}


/**
 * @typedef CopySheetResult
 * @property {boolean} success
 * @property {number} sheetId
 * @property {string} title
 * @property {index} number
 * @property {string} sheetType
 * @property {{rowCount:number, columnCount:number}} gridProperties
 */
/**
 * 
 * @param {{fromSpreadsheetId:string, fromSheetId:string, toSpreadsheetId:string}} param0 
 * @returns Promise<CopySheetResult>
 */
const  copySheetFromTo = async({fromSpreadsheetId, fromSheetId, toSpreadsheetId}) => {
  const resultObj = {
    success: false,
    sheetId:'',
    title:'',
    index:-1,
    sheetType:'',
    gridProperties: {rowCount:0, columnCount:0},
  }

  const request =  {
    spreadsheetId :fromSpreadsheetId,
    sheetId : fromSheetId,
    resource:{
      destinationSpreadsheetId: toSpreadsheetId,
    },
  }
  const result = await  _sheetService.spreadsheets.sheets.copyTo(request)
    .catch((err) => err.message)
  if (typeof result === 'string') { // The catch happened 
    resultObj.title = result
    return resultObj
  }

  const successObj = {success:true, ...result.data}
  return successObj
}

/**
 * @typedef rowColumnInfo
 * @property {number} startRow
 * @property {number | undefined} endRow
 * @property {number} startCol
 * @property {number | undefined} endCol
 */
const setListDataValidation = async({spreadsheetId, sheetId, rcInfo, valuesList}) => {
  const  gridRange = {
    sheetId,
    startRowIndex: rcInfo.row,
    startColumnIndex: rcInfo.col,
  }

  if (rcInfo.numRows != undefined) {
    gridRange['endRowIndex'] = rcInfo.row + rcInfo.numRows
  }
  if (rcInfo.numCols != undefined) {
    gridRange['endColumnIndex'] = rcInfo.col + rcInfo.numCols
  }

  const values = valuesList.map(value => ({userEnteredValue:`${value}`}))
  const request = 
    {
      setDataValidation: {
        range: gridRange,
        rule: {
          condition: {
            type: 'ONE_OF_LIST',
            values,
          },
          showCustomUi:true,
          strict: false,
        },
      },
    }
  
  const result = await sheetFormat.makeSingleObjBatchRequest({id:spreadsheetId, requestObj:request})

  return result
}

module.exports = {
  init,
  autoInit,
  getSheetValues,
  setRangeData,
  setSheetCell,
  getSheetProperties,
  getSheetTitle,
  getSheetGridProperties,
  getSheetByName,
  getSheetIdByName,
  copySheetFromTo,
  copySheetByNameFromTo,
  setListDataValidation,
}
