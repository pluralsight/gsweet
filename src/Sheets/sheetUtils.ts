// TODO Move some common routines in here that sheetFormatOps uses as do
// code that creates validation and possibly others
// Getting a Grid Range is a good example
import {google, sheets_v4} from "googleapis"
let _sheetService: sheets_v4.Sheets
import * as ss from "./sheetService"

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

  const batchUpdateParam: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
    spreadsheetId: id,
    resource: requests,
  } as sheets_v4.Params$Resource$Spreadsheets$Batchupdate
  _sheetService.spreadsheets.batchUpdate(batchUpdateParam).catch(err => {
    console.error("Error trying to do batch update", err.message) // JSON.stringify(err, null, 2))
    returnObj.isValid = false
    returnObj.message = "batchUpdate() request failed"
  })

  return returnObj
}
