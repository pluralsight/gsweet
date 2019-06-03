const googleAuth = require('google-auth-library')

let gsweet
let clientSecrets
let sheetsCreds
let driveCreds

let initialized = false

/** Only needed for testing */
const forceInitialization = () => {
  initialized = false
}

/** One time initialization to load credentials */
const init = () => {
  if (process.env.GSWEET == undefined) {
    throw ('environment variables with credentials are missing')
  }
  try {
    gsweet = JSON.parse(process.env.GSWEET)
    clientSecrets = gsweet.client_secrets
    sheetsCreds = gsweet.sheet_credentials
    driveCreds = gsweet.drive_credentials
    initialized = true
  } catch (error) {
    console.log('problem parsing environment variable gsweet')
    console.log(process.env.GSWEET)
  }
}

/** Get the Google Sheet authorization */
const getGoogleSheetAuth = () => {
  const oauth2Client = getOAuth2Client()
  oauth2Client.credentials = sheetsCreds
  return oauth2Client
}

/** Get the Google Drive authorization */
const getGoogleDriveAuth = () => {
  const oauth2Client = getOAuth2Client()
  oauth2Client.credentials = driveCreds
  return oauth2Client
}

/** @protected
 * Called for any auth - goes to Google with the needed credentials
 */
const getOAuth2Client = () => {
  if (!initialized) {init()}

  const clientSecret = clientSecrets.installed.client_secret
  const clientId = clientSecrets.installed.client_id
  const redirectUrl = clientSecrets.installed.redirect_uris
  const oauth2Client = new googleAuth.OAuth2Client(clientId, clientSecret, redirectUrl)
  return oauth2Client
}

module.exports = {
  getGoogleSheetAuth,
  getGoogleDriveAuth,
  forceInitialization,
}
