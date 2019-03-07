# gsweet Helper

## Summary

A project for gathering the core methods and tools for making it easier to write scripts across all the products in the gSuite. It is **highly** likely that this project will end up containing a number of useful tools that take advantage of gSuite. If that is the case it is suggested that additional ReadMe documents be created in the subfolder that hosts any particular tool to describe its purpoose. Ideally, at some point we could extract the core reusable portions of this project and package them as an npm library to make it reusable across many projects. One stumbling block right now is the authentication issue. 

## Authentication (when developing)

If you clone this repo it will not contain the needed authorization pieces. You will need to create a `.env` file and add variables that hold the required JSON objects as strings. These variables will be called
CLIENT_SECRETS  
SHEET_CREDS  
DRIVE_CREDS  

Google has a [quick-start](https://developers.google.com/sheets/api/quickstart/nodejs) on how to create all of these credentials. Once you have them in json format in a file you can write a short utility to require() the file and then use 

```javascript
fs.writeFileSync("secret.txt", JSON.stringify(data));  
```

Then copy the contents of `secret.txt` into for example the single quotes below:
`CLIENT_SECRETS =''`
Repeat that process for the sheet and drive credentials and you're done. The environment variables are only used in the googleAuthHelper.js file.  

## Authentication (for another project)

In your destination project just clone your .env file and put it at the root folder. 
You can either install this project using a relative or absolute file syntax. For example
`npm i ../gsuite-helper`
the name of the package is gsweet. So you then require like

```javascript
const {driveOps} = require("gsweet");
driveOps.autoInit();
const result = driveOps.getFileByName("SomeDriveFile");
```

A more convenient way to use the package, especially if it is still under development is to go the root directory of the development folder and use `npm link`. That creates a sym link with the package.json name of gsweet. Then in any folder where you want to use it can type
`npm link gsweet` and it will be installed and linked dynamically.  

## Testing

I have found unit tests for a lot of the core API functionality to be of limited usefulness. I did write the "ops" files such that the actual API call could be easily faked. However, most of the core API functionality has little  logic. This project is set up such that unit tests will be written with a `test.js` suffix and integration tests will end with `testi.js`. You can run unit tests with `npm test` and the integration tests with `npm run test:int`. 

## Reference on Using the Google Apis

Check out some [Drive Samples](https://github.com/googleapis/google-api-nodejs-client/tree/master/samples/drive). 

The [Drive API](https://developers.google.com/drive/api/v3/folder) 

## Additional Documentation

This project uses JSDoc and the `out` folder contains the processed documentation

## Using this package

