# gsweet

## Summary

A project for gathering the core methods and tools for making it easier to write scripts across all the products in the gSuite.  

## Installation 

`npm i gsweet --save`  

## Basic Use

Once you have your [authentication JSON  file](#Authentication)  set up in a file named `.env.json`  you require the package and call the auth() function

```javascript
const {driveOps, sheetOps, auth} = require("gsweet")
auth()
```

In this example the lack of a parameter is telling the package to look for `.env.json` at the root of the project. If your credentials file lives somewhere else you can just pass in a relative or absolute path like this

```javascript
const {driveOps, sheetOps, auth} = require("gsweet")
auth("/Users/user-name/ENV_VARS/envJsonFilename")
```

The code that runs loads the JSON file and parses the top level objects into environment variables needed by this package.  

A full example usage of the package might look like this

```javascript
const {driveOps, sheetOps} = require("gsweet")
auth()

const main = async () => { 
  // Drive Examples
  driveOps.autoInit()
  const TEST_FILE = "<name of sheet in your drive>"
  let result = await driveOps.getFiles({withName: TEST_FILE})
  console.log(result)

  console.log(full)

  // Sheet Examples
  const sheetRange = {
    id: "<google id of a sheet in your drive>",
    range: "Sheet1!A1",
    data: [["Test1"], ["Test2"]],
  }
  sheetOps.autoInit()
  result = await sheetOps.setRangeData(sheetRange)
  console.log(result.config.data.values) // just showing the values passed in
  console.log("Num Cells Updated:", result.data.updatedCells)

}
main()
```

## Authentication

If you clone this repo it will not contain the needed authorization pieces. You will need to create a `.env.json` file at the root level of your project. The json object should have the following structure:

```JSON
"gsweet":{
   "client_secrets": {
    },
    "drive_credentials": {
    },
    "sheet_credentials": {
    }
  }
}
```

You will need to fill in those objects with the expected json that Google requires.  Google has a [quick-start](https://developers.google.com/sheets/api/quickstart/nodejs) on how to create all of these credentials. You can see a [full example](#Full-.json.env-example) of the JSOn file in the Reference section of this Readme.

## Testing

This package contains both unit tests and integration tests. The integration tests are fragile since they require access to specific files and folders in google drive. The constants for these files are stored in the `test-data/integration.json`. Modify that document to contain the names and ids for your files. The expected structure of the test data is
test-folder

```
---node-test-subfolder
  |---doc-in-subfolder
  |---sheet-in-subfolder
  node-test-sheet
  node-test-doc
```

The top of the integration test files also uses `create-env` to load credentials. You will need to change that path to point to your credentials json file.

This project is set up such that unit tests will be written with a `test.js` suffix and integration tests will end with `testi.js`. You can run unit tests with 
`npm test` -- the unit tests  
`npm run test:int` -- the integration tests  
`npm run test:all` -- both unit and integration tests

## Reference on Using the Google Apis

This is information for anyone contributing to (rather than using) this project.

Check out some [Drive Samples](https://github.com/googleapis/google-api-nodejs-client/tree/master/samples/drive).  

The [Drive API](https://developers.google.com/drive/api/v3/folder)  

## Additional Documentation

This project uses JSDoc comments. If you want to generate the HTML documentation in an `/out` folder at the root of the project use:  
`npm run doc`

## Reference

### Full .json.env example 

```JSON
{
  "gsweet":{
    "client_secrets": {
        "installed": {
          "client_id": "your id goes here",
          "project_id": "your project id",
          "auth_uri": "https://accounts.google.com/o/oauth2/auth",
          "token_uri": "https://accounts.google.com/o/oauth2/token",
          "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
          "client_secret": "your client secret",
          "redirect_uris": [
            "urn:ietf:wg:oauth:2.0:oob",
            "http://localhost"
          ]
        }
      },
      "drive_credentials": {
        "access_token": "a really long token",
        "refresh_token": "a shorter token",
        "token_type": "Bearer",
        "expiry_date": 123
      },
      "sheet_credentials": {
        "access_token": "your token",
        "refresh_token": "the refresh toeken",
        "scope": "https://www.googleapis.com/auth/spreadsheets",
        "token_type": "Bearer",
        "expiry_date": 123
      }
  }
}
```