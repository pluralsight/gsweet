// @ts-check
/**
 * @file Handles talking to the Google Drive API
 * [GPL License Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 *
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later
 * @module
 */
const ss = require('./sheetService')
const logger = require('../utils/logger')
const formatOps = require('./sheetFormatOps')

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
 * @property id:string
 * @property range:string
 */

/**
 * @typedef IdRangeDataType
 * @property id:string
 * @property range:string
 * @property data:[][]
 */

/**
 * @typedef IdRangeValueType
 * @property id:string
 * @property range:string
 * @property value:any
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
    logger.error(JSON.stringify(err, null, 2))
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
 * @returns {Promise<Array.<Array>>} an array of rows containing an array for each column of data (even if only one column).
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
    logger.error(msg)
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
 * @param {{sheetId:string, sheetIndex=:number, sheetName=:string}} sheetInfo
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
 * @private
 * @param {{sheetName:string, sheets:object}} param0 
 * @returns {gridProperties}
 */
const getGridPropertiesByName = ({sheetName, sheets}) => {
  const result = {isValid:true,
    message:'',
    rowCount:0,
    columnCount:0,
  } 
  for (const sheet of sheets) {
    if (sheet.properties.title === sheetName) {
      const gp = sheet.properties.gridProperties
      result.rowCount = gp.rowCount
      result.columnCount = gp.columnCount
      return result
    }
  }
  result.isValid = false
  result.message = 'Error: request for sheet name that does not exist'
  return result
}

/**
 * @private
 * @param {{sheetIndex:number, sheets:object}} param0 
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
 * @param {{id:string, formatOptions:formatOps.FormatCellsColorType} {id,formatOptions} 
 */
const formatCellsBgColor = async ({id, formatOptions}) => {
  const request = formatOps.getFormatCellBgColorRequest(formatOptions)
  return batchUpdate({id, request})
}

/**
 * Example of how to set FG,BG, Bold, fontsize etc
 * The fields property restricts things from getting changes so if
 * I just wanted the text foreground to change I could replace
 * textFormat with textFormat/foregroundColor
 * @param {{id:string, formatOptions:formatOps.FormatCellsColorType} {id,formatOptions} 
 */
const formatCells = async ({id, formatOptions}) => {
  const request = formatOps.getFormatCellsRequest(formatOptions)
  return batchUpdate({id, request})
}

/**
 * 
 * @param {{id:string, formatOptions:formatOps.FormatCellsNoteType}} param 
 */
const addNoteToCell = async ({id, formatOptions}) => {
  const request = formatOps.getAddNoteToCellRequest(formatOptions)
  return batchUpdate({id, request})
}

/**
 * 
 * @param {{id:string, request:object} param0 
 */
const batchUpdate = async ({id, request}) => {
  const result = await _sheetService.spreadsheets.batchUpdate({
    spreadsheetId:id,
    resource:request,
  })
    .catch((err) => {
      console.log('Error trying to do batch update', JSON.stringify(err, null, 2))
      return 'batch request failed'
    })
  return result
}


module.exports = {
  init,
  autoInit,
  getSheetValues,
  setRangeData,
  setSheetCell,
  getSheetProperties,
  getSheetGridProperties,
  formatCellsBgColor,
  formatCells,
  addNoteToCell,
}
