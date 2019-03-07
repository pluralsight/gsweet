const googleAuth = require("google-auth-library")

let gsweet
let clientSecrets
let sheetsCreds
let driveCreds

let initialized = false

const init = () => {
  if (process.env.gsweet === undefined) {
    throw ("environment variables with credentials are missing")
  }
  gsweet = JSON.parse(process.env.gsweet)
  clientSecrets = gsweet.client_secrets
  sheetsCreds = gsweet.sheet_credentials
  driveCreds = gsweet.drive_credentials
  initialized = true
}

const getGoogleSheetAuth = () => {
  const oauth2Client = getOAuth2Client()
  oauth2Client.credentials = sheetsCreds
  return oauth2Client
}

const getGoogleDriveAuth = () => {
  const oauth2Client = getOAuth2Client()
  oauth2Client.credentials = driveCreds
  return oauth2Client
}

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
}
