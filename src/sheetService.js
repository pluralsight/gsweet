const authHelper = require("./googleAuthHelper");
const {google} = require("googleapis");

let _sheetService = undefined;

const init = (sheetService = undefined) => {
  // If a value is passed in always use it. Typicallly used for unit testing
  if (sheetService !== undefined) {
    _sheetService = sheetService;
  }
  else {
    // if we don't have one, get the default
    if (_sheetService === undefined) {
      _sheetService = getSheetServiceDefault();
    }
  }
  return _sheetService;
};
// This needs to be run just once, when the program runs, normally from init().
// The results of this function are stored in _sheetService.
// If _sheetService is  null when it's needed this method is auto called.
const getSheetServiceDefault = () => {
  const auth = authHelper.getGoogleSheetAuth();
  return google.sheets({version: "v4", auth});
};

module.exports = {
  init,
  getSheetServiceDefault,
};