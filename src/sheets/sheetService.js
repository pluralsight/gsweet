/**
 * @file Creat the Google drive service needed to hit the Drive API
 * @author Tod Gentille 
 * @requires NPM:googleapis
 * @requires ../googleAuthHelper
 * @module
 */

const {google} = require('googleapis')
const authHelper = require('../googleAuthHelper')

/** holds the sheetService created by init()  
 *  @type {Object} 
 */
let _sheetService = undefined

/**
 *  This needs to be called just once.
 *  The results of this function are stored in `_sheetService`.
 *  If no service is passed to init it grabs the default Google Sheet Service.
 *  Passing the service in makes it easy to do unit testing since a Fake can
 *  be passed in.
 * @returns {Object} - the service. Typically not needed by caller.
 */
const init = (sheetService = undefined) => {
  if (sheetService !== undefined) {
    _sheetService = sheetService
  }
  else {
    // if we don't have one, get the default
    if (_sheetService === undefined) {
      _sheetService = getSheetServiceDefault()
    }
  }
  return _sheetService
}

/**
 * Get the default Google Sheet API service.
 * @returns {Object} the actual Google Sheet Service
 */
const getSheetServiceDefault = () => {
  const auth = authHelper.getGoogleSheetAuth()
  return google.sheets({version: 'v4', auth})
}

module.exports = {
  init,
  getSheetServiceDefault,
}