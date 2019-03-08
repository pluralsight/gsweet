# gsweet

## Summary

A project for gathering the core methods and tools for making it easier to write scripts across all the products in the gSuite.  

## Installation 

`npm i gsweet --save`  

## Basic Use

Once you have authentication set up basic usage looks like this:

```javascript
const gsweet = require("gsweet")
gsweet.auth()
const {driveOps, sheetOps} = gsweet


const main = async () => {
  driveOps.autoInit()
  const TEST_FILE = "node-test-sheet"
  let result = await driveOps.getFilesByName(TEST_FILE)
  console.log(result)

  const sheetRange = {
    id: "105LhrjQp75T4Q4mZ337ydosno6tjKjDzXNutXf24c1c",
    range: "Sheet1!A1",
    data: [["Test1"], ["Test2"]],
  }
  sheetOps.autoInit()
  result = await sheetOps.setRangeData(sheetRange)
  console.log(result.config.data.values) // just showing the values passed in
  console.log("Num Cells Updated:", result.data.updatedCells)
  // console.log(result) if you want to see all the fields available

  sheetRange.value = "Convenient for writing a single cell";
  await sheetOps.setSheetCell(sheetRange);
}
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

You will need to fill in those objects with the expected json that Google requires.  Google has a [quick-start](https://developers.google.com/sheets/api/quickstart/nodejs) on how to create all of these credentials. The `auth()` call creates the needed environment variables and this package will use those environment variables and JSON.parse them into the required objects. If you store your credentials in a different folder or with a different file name you can pass the path to the file in the `auth()` call.

```javascript
gsweet.auth("/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json")
```

## Testing

This package contains both unit tests and integration tests. The integration tests are fragile since they require access to specific files and folders in google drive. The constants for th ese files are stored in the `test-data/integration.json`. Modify that document to contain the names and ids for your files. The expected structure of the test data is
test-folder
```
---node-test-subfolder
  |---doc-in-subfolder
  |---sheet-in-subfolder
  node-test-sheet
  node-test-doc
```

The top of the integration test files also uses `create-env` to load credentials. You will need to change that path to point to your credentials json file.

This project is set up such that unit tests will be written with a `test.js` suffix and integration tests will end with `testi.js`. You can run unit tests with `npm test` and the integration tests with `npm run test:int`. 

## Reference on Using the Google Apis

Check out some [Drive Samples](https://github.com/googleapis/google-api-nodejs-client/tree/master/samples/drive). 

The [Drive API](https://developers.google.com/drive/api/v3/folder) 

## Additional Documentation

This project uses JSDoc and the `out` folder contains the processed documentation

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