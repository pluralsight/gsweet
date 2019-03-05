const googleAuth = require("google-auth-library");
// const secrets = require("../_local/client_secret.json");
const secrets = require("/_local/client_secret.json");
const sheetsCreds = require("../_local/sheet-credentials.json");
const driveCreds = require("../_local/drive-credentials.json");
// const {Oauth2Client} = require ("google-auth-library");
// Each Google user must run the auth/auth_drive.js to create their own token
// on each machine where they want to use this if I don't have read access to their files.


const getGoogleSheetAuth = () => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.credentials = sheetsCreds;
  return oauth2Client;
};

const getGoogleDriveAuth = () => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.credentials = driveCreds;
  return oauth2Client;
};


const getOAuth2Client = () => {
  const clientSecret = secrets.installed.client_secret;
  const clientId = secrets.installed.client_id;
  const redirectUrl = secrets.installed.redirect_uris;
  // const auth = new GoogleAuth();
  const oauth2Client = new googleAuth.OAuth2Client(clientId, clientSecret, redirectUrl);
  return oauth2Client;
};

module.exports = {
  getGoogleSheetAuth,
  getGoogleDriveAuth,
};
