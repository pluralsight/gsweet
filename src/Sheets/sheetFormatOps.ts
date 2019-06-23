// @ts-check
const ss = require("./sheetService")
let _sheetService
/**
 * @file Handles talking to the Google Drive API
 * [GPL License Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 *
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later
 * @module
 */
/**
 * @typedef {Object} FormatCellsBaseType
 * @property {string} sheetId  // This is the tab id number - starting with 0
 * @property {number} row
 * @property {number} col
 */

/**
 * @typedef {Object} MultipleCellsType
 * @property {number} numRows
 * @property {number} numCols
 */
/**
 * @typedef  {Object} ColorType
 * @property {number} r
 * @property {number} g
 * @property {number} b  // numbers for rgb 0.0->1.0
 */

/**
 * @typedef   {Object} FormatSingleColorType
 * @property {string} sheetId  // This is the tab id number - starting with 0
 * @property {number} row
 * @property {number} col
 * @property {number} r
 * @property {number} g
 * @property {number} b  // numbers for rgb 0.0->1.0
 */

/**
 * @typedef   {Object} FormatCellsColorType
 *  * @property {string} sheetId  // This is the tab id number - starting with 0
 * @property {number} row
 * @property {number} col
 * @property {ColorType} color
 * @property {number} numRows
 * @property {number} numCols
 */

/**
 * @typedef   NoteType
 * @property {string} note
 */

/**
 * @typedef {Object} FormatCellsNoteType
 * @property {string} sheetId  // This is the tab id number - starting with 0
 * @property {number} row
 * @property {number} col
 * @property {string} note
 */

/** just get the default service and use it */
export const autoInit = () => {
  _sheetService = ss.init()
}
/**
 *
 * @param {FormatCellsColorType} param
 */
export const getBgColorRequest = param => {
  const {sheetId, row, col, numRows, numCols, color} = param
  const singleRequest = {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: row,
        endRowIndex: row + numRows,
        startColumnIndex: col,
        endColumnIndex: col + numCols,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: {
            red: color.r,
            green: color.g,
            blue: color.b,
          },
        },
      },
      fields: "userEnteredFormat(backgroundColor)",
    },
  }

  return singleRequest
}

/**
 * Example of how to set FG,BG, Bold, fontsize etc
 * The fields property restricts things from getting changes so if
 * I just wanted the text foreground to change I could replace
 * textFormat with textFormat/foregroundColor. As is any textFormat not specified
 * will get reset to the google sheet default value for that formatting property
 * @param {FormatCellsColorType} param
 */
export const getFormatCellsRequest = param => {
  const {sheetId, row, col, numRows, numCols, color} = param
  const request = {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: row,
        endRowIndex: row + numRows,
        startColumnIndex: col,
        endColumnIndex: col + numCols,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: {
            red: 1.0,
            green: 1.0,
            blue: 1.0,
          },
          horizontalAlignment: "CENTER",
          textFormat: {
            foregroundColor: {
              red: color.r,
              green: color.g,
              blue: color.b,
            },
            fontSize: 12,
            bold: true,
          },
        },
      },
      fields: "userEnteredFormat(backgroundColor ,textFormat ,horizontalAlignment)",
    },
  }

  return request
}

/**
 *
 * @noteOptions {FormatCellsNoteType} noteOptions
 */
export const getAddNoteRequest = noteOptions => {
  const {sheetId, row, col, note} = noteOptions
  const request = {
    updateCells: {
      range: {
        sheetId,
        startRowIndex: row,
        endRowIndex: row + 1,
        startColumnIndex: col,
        endColumnIndex: col + 1,
      },
      rows: {
        values: [
          {
            note,
          },
        ],
      },
      fields: "note",
    },
  }
  return request
}

const getRenameSheetRequest = ({newName, sheetId}) => {
  const request = {
    updateSheetProperties: {
      properties: {
        sheetId,
        title: newName,
      },
      fields: "title",
    },
  }
  return request
}

export const renameSheet = async ({id, newName, sheetId}) => {
  const requestObj = getRenameSheetRequest({newName, sheetId})
  return makeSingleObjBatchRequest({id, requestObj})
}

/**
 * @param {{id:string, formatOptions:FormatCellsColorType}} param0
 */
export const formatCellsBgColor = async ({id, formatOptions}) => {
  const requestObj = getBgColorRequest(formatOptions)
  return makeSingleObjBatchRequest({id, requestObj})
}

/**
 * @param {object} obj
 * @param {string} obj.id
 * @param {FormatSingleColorType} obj.singleCellOptions
 */
export const formatSingleBgColor = async ({id, singleCellOptions}) => {
  const formatOptions = {...singleCellOptions}
  // @ts-ignore
  formatOptions.numRows = 1
  // @ts-ignore
  formatOptions.numCols = 1
  // @ts-ignore
  const result = formatCellsBgColor({id, formatOptions})
  return result
}

/**
 * Example of how to set FG,BG, Bold, fontsize etc
 * The fields property restricts things from getting changes so if
 * I just wanted the text foreground to change I could replace
 * textFormat with textFormat/foregroundColor
 * @param  {object} obj
 * @param {string} obj.id  spreadsheet id
 * @param {FormatCellsColorType} obj.formatOptions
 */
export const formatCells = async ({id, formatOptions}) => {
  const requestObj = getFormatCellsRequest(formatOptions)
  return makeSingleObjBatchRequest({id, requestObj})
}

/**
 * @param {object} obj
 * @param {string} obj.id  id of the google spreadsheet
 * @param {FormatCellsNoteType} obj.noteOptions  google API request with `notes` field
 */
export const addNoteToCell = async ({id, noteOptions}) => {
  const requestObj = getAddNoteRequest(noteOptions)
  return makeSingleObjBatchRequest({id, requestObj})
}

/**
 * Turn the passed object into an array and then put that array in the
 * object that the batchUpdate Google API wants
 * @param {object} obj
 * @param {string} obj.id the id of the spreadsheet
 * @param {object} obj.requestObj a single object that represents a google API request
 */
export const makeSingleObjBatchRequest = async ({id, requestObj}) => {
  const singleRequest = [requestObj]
  const requests = prepareBatchRequest(singleRequest)
  return batchUpdate({id, requests})
}

/**
 * Take the passed array of requests and format them and send them off to the spreadsheet
 * @param {object} obj
 * @param {string} obj.id the spreadsheet ID
 * @param {[object]} obj.requestArray
 */
export const makeBatchRequest = async ({id, requestArray}) => {
  const requests = prepareBatchRequest(requestArray)
  return batchUpdate({id, requests})
}
/**
 * Put the array of requests into an object that has a `requests` property
 * @param {Array<object>} requests
 */
const prepareBatchRequest = requests => {
  const batchReq = {
    requests: [...requests],
  }
  return batchReq
}

/**
 * Call the Google API that processes batchUpdate requests. This is how sheet
 * formatting and adding of notes is done.
 * @param {object} obj
 * @param {string} obj.id
 * @param {object} obj.requests
 * @returns {Promise<object>}
 */
const batchUpdate = async ({id, requests}) => {
  const returnObj = {
    isValid: true,
    message: "OK",
  }
  _sheetService.spreadsheets
    .batchUpdate({
      spreadsheetId: id,
      resource: requests,
    })
    .catch(err => {
      console.error("Error trying to do batch update", err.message) // JSON.stringify(err, null, 2))
      returnObj.isValid = false
      returnObj.message = "batchUpdate() request failed"
    })

  return returnObj
}
