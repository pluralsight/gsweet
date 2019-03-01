# gSuite Helper

## Summary

A project for gathering the core methods and tools for making it easier to write scripts across all the products in the gSuite. It is **highly** likely that this project will end up containing a number of useful tools that take advantage of gSuite. If that is the case it is suggested that additional ReadMe documents be created in the subfolder that hosts any particular tool to describe its purpoose. Ideally, at some point we could extract the core reusable portions of this project and package them as an npm library to make it reusable across many projects. One stumbling block right now is the authentication issue. 

## Authentication

If you clone this repo it will not contain the needed authorization pieces. You will need to create a `_local` folder at the  root level of your project. That folder will need to have the following files. 
client_secret.json
sheet-credentials.json
drive-credentials.json


Google has a [quick-start](https://developers.google.com/sheets/api/quickstart/nodejs) on how to create all of these files. What I have name `client_secret.json` here is what they call `credentials.json` in those directions. You want to create a separate new project to follow that tutorial. Once you are finished you can just copy over the files it creates and name the per the above names.
