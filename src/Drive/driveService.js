const {google} = require("googleapis");
const authHelper = require("../googleAuthHelper");

let _driveService = undefined;

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

const getDriveServiceDefault = () => {
  return google.drive({
    version: "v3",
    auth: authHelper.getGoogleDriveAuth()
  });
};

module.exports = {
  init,
  getDriveServiceDefault,
};
