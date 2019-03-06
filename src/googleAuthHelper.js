const googleAuth = require("google-auth-library")

let clientSecrets
let sheetsCreds
let driveCreds

let initialized = false

const init = () => {
  if (process.env.client_secrets === undefined ||
    process.env.drive_credentials === undefined ||
    process.env.sheet_credentials === undefined) {
    throw ("environment variables with credentials are missing")
  }
  clientSecrets = JSON.parse(process.env.client_secrets)
  sheetsCreds = JSON.parse(process.env.sheet_credentials)
  driveCreds = JSON.parse(process.env.drive_credentials)
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
