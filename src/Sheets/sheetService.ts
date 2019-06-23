import {google, sheets_v4} from "googleapis"
import * as authHelper from "../googleAuthHelper"

let _sheetService: sheets_v4.Sheets | undefined = undefined

/**
 *  This needs to be called just once.
 *  The results of this function are stored in `_sheetService`.
 *  If no service is passed to init it grabs the default Google Sheet Service.
 *  Passing the service in makes it easy to do unit testing since a Fake can
 *  be passed in.
 * @returns {Object} - the service. Typically not needed by caller.
 */
export const init = (sheetService = undefined): sheets_v4.Sheets => {
  if (sheetService !== undefined) {
    _sheetService = sheetService
  } else {
    // if we don't have one, get the default
    if (_sheetService === undefined) {
      _sheetService = getSheetServiceDefault()
    }
  }
  return _sheetService as sheets_v4.Sheets
}

/**
 * Get the default Google Sheet API service.
 * @returns {Object} the actual Google Sheet Service
 */
export const getSheetServiceDefault = (): sheets_v4.Sheets => {
  const auth = authHelper.getGoogleSheetAuth()
  return google.sheets({version: "v4", auth})
}
