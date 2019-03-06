//require("dotenv-json").load({path: "/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json", debug: "true"})
const googleAuth = require("google-auth-library")
const logger = require("./utils/logger")
// const fs = require("fs")
// require("dotenv").config({path: "/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env", debug: "true"})
// if (process.env.CLIENT_SECRETS === undefined) {
//   require("dotenv").config({path: "/Users/tod-gentille/dev/node/gsweet.env"})
//   console.log(process.env.CLIENT_SECRETS)
// }

/* 
const clientSecrets = require("../_local/client_secret.json")
const sheetsCreds = require("../_local/sheet-credentials.json")
const driveCreds = require("../_local/drive-credentials.json")
**************/

let clientSecrets
let sheetsCreds
let driveCreds

// clientSecrets = JSON.parse(process.env.CLIENT_SECRETS)
// sheetsCreds = JSON.parse(process.env.SHEET_CREDS)
// driveCreds = JSON.parse(process.env.DRIVE_CREDS)

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
  // console.log("NOT WORKING CS>>>", clientSecrets)
  // console.log("SC>>>", sheetsCreds)
  // console.log("DC>>>", driveCreds)
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
