/**
 * @module 
 */
const {google} = require("googleapis");
const authHelper = require("../googleAuthHelper");

let _driveService = undefined;

/**
 * Set up the service used for the Google Drive API. If no parameter passed in
 * uses the real google API, a fake or mock can be passed in for testing. 
 * @param {Object} svc (optional)  if not passed uses the google.drive service
 */
const init = (svc = undefined) => {
  if (svc !== undefined) {
    _driveService = svc;
  } else {
    if (_driveService === undefined) {
      _driveService = getDriveServiceDefault();
    }
  }
  return _driveService;
};

const getDriveServiceDefault = () => google.drive({
  version: "v3",
  auth: authHelper.getGoogleDriveAuth(),
});

module.exports = {
  init,
  getDriveServiceDefault,
};
