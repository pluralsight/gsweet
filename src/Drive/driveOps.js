// @ts-check
/** @module */
/**
 * @file Handles talking to the Google Spreadsheet API  
 * [documentation for mime-types](https://developers.google.com/drive/api/v3/mime-types)  
 * [documentation for all file meta data](https://developers.google.com/drive/api/v3/reference/files)    
 * a few meta types we aren't using that might be interesting are `starred, shared, description`
 *   
 * NOTE: Before using init() **MUST** be called and a driveService passed in.  
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later [Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 */

const logger = require("../utils/logger");
const MAX_FILES_PER_PAGE = 1000;
let _driveService;

/**
 * Enum for the currently supported google mime-types
 * @readonly
 * @enum {any}
 */
const mimeType = {
  /** @type {number} */
  FOLDER: 1, /**  FILE is not a google recognized value, used to mean anything other than a folder. */
  FILE: 2, /** @type {number} */
  SPREADSHEET: 3, /** @type {number} */
  DOC: 4,
  /** place to store the actual strings that google uses for mime-types */
  properties: {
    1: {type: "application/vnd.google-apps.folder"},
    2: {type: "N/A"},
    3: {type: "application/vnd.google-apps.spreadsheet"},
    4: {type: "application/vnd.google-apps.document"},
  },
  /**  Convenience function to return the google mime-types- called with our ENUM value */
  getType: (value) => mimeType.properties[value].type,
};


/**  the file fields to return on a search by name 
 * @protected
 * @const {string}   
 * @default  */
const FILE_META_FOR_NAME_SEARCH = "files(id, name)";
/** the file fields to return on getting all files in a folder 
 * @protected
 * @const {string} 
 * @default */
const FILE_META_FOR_FOLDER_SEARCH = "files(id, name, mimeType)";

/**
 * Set up this module with the object that allows access to the google sheet
 * calls. Typically from the value returned by driveService.init(). When testing
 * a mocked object can be passed in. Only needs to be done once. 
 * @param {Object} driveService optional  
 */
const init = (driveService) => {
  _driveService = driveService;
};


/**
 * Convenience function that returns the id for a file
 * @param {string} filename 
 * @returns {Promise<string>} google id for the file
 */
const getFileIdFromName = async (filename) => {
  const file = await getFileByName(filename);
  return file.id;
};


/**
 * Get a single file for the passed name. If a single file isn't found
 * an error is thrown.
 *  @author Tod Gentille <tod-gentille@pluralsight.com>
 * @param {string} filename 
 * @returns {Promise<{name, id}>}  a single object that has the FILE_META_FOR_NAME_SEARCH properties
 */
const getFileByName = async (filename) => {
  const files = await getFilesByName(filename);
  if (files.length !== 1) {
    throw (`Found ${files.length} files.`);
  }
  return files[0];
};


/**
 * Get a list of files/folders that match (either exact or partial) the passed string
 * @param {string} filename - the filename to find
 * @param {boolean=} partial - if true does a contains match on the filename  
 * @returns {Promise<Array.<{id,name}>>}  array of objects with {id, name} properties
 */
const getFilesByName = async (filename, partial = undefined) => {
  let query = `name='${filename}'`;
  if (partial) {
    query = `name contains '${filename}'`;
  }
  const response = await _driveService.files.list(
    {
      q: query,
      pageSize: MAX_FILES_PER_PAGE,
      fields: `nextPageToken, ${FILE_META_FOR_NAME_SEARCH}`,
    })
    .catch(error => {
      throw (`\r\nFor ${filename} - The Google Drive API returned:${error}`);
    });
  const {files} = response.data;
  return files;
};


/**
 * Just get the files for the user. Will only return the google API max
 * of 1000 files.
 * @returns {Promise<Array.<{name, id, mimeType}>>} array of objects, where each object
 * has the properties specified by the constant `FILE_META_FOR_FOLDER_SEARCH`
 */
const listFiles = async () => {
  const response = await _driveService.files.list({
    fields: `${FILE_META_FOR_FOLDER_SEARCH}`,
    pageSize: MAX_FILES_PER_PAGE,
  })
    .catch(error => {throw (error);});

  return response.data.files;
};


/**
 * Example of how to use the nextPageToken to get all the files
 * in a folder when there are more than 1000
 */
const countAllFiles = async () => {
  let nextPage = null; // start on first page
  let totalCount = 0;
  do {
    const response = await _driveService.files.list({
      pageToken: nextPage,
      fields: `nextPageToken, ${FILE_META_FOR_FOLDER_SEARCH}`,
      pageSize: MAX_FILES_PER_PAGE,
    })
      .catch(error => {
        logger.error(JSON.stringify(error));
      });
    nextPage = response.data.nextPageToken;
    if (response.data.files !== undefined) {
      totalCount += response.data.files.length;
    }

    logger.debug(nextPage);
  } while (nextPage !== undefined && totalCount < 20000);
  logger.info(`Total file count: ${totalCount}`);
};


/**
 * Get all the Files in the passed folderId - the query syntax reads oddly
 * The api is querying wether the parents collection contains the passed id. 
 * the field is `parents` and the operator is `in`.  
 * [Google docs on search parameters](https://developers.google.com/drive/api/v3/search-parameters)  
 * @param {string} folderId 
 * @param {mimeType=} desiredType enum Type defined here to specify type of file to get 
 * @returns {Promise<Array<{name, id, mimeType}>>} array of file objects where each object has the properties
 * specified by the constant `FILE_META_FOR_FOLDER_SEARCH`
 */
const getFilesInFolder = async (folderId, desiredType = undefined) => {
  const mimeClause = getMimeTypeClause(desiredType);
  const response = await _driveService.files.list(
    {
      q: `parents in '${folderId}' ${mimeClause}`,
      pageSize: MAX_FILES_PER_PAGE,
      fields: `nextPageToken, ${FILE_META_FOR_FOLDER_SEARCH}`,
    })
    .catch(error => {
      throw (`\r\nFor parent folder ${folderId} - files.list() returned:${error}`);
    });
  const nextToken = response.data.nextPageToken;
  if (nextToken !== undefined) {
    logger.debug(`NEXT PAGE TOKEN ${response.data.nextPageToken}`);
  }

  const {files} = response.data;
  return files;
};


/**
 * Get just the names of the files in the specified `folderId`
 * @param {string} folderId 
 * @param {mimeType=} desiredType 
 * @returns {Promise<Array.<string>>} array of strings containing filenames
 */
const getFileNamesInFolder = async (folderId, desiredType = undefined) => {
  const files = await getFilesInFolder(folderId, desiredType);
  return files.map(e => e.name);
};


/**
 * Get the files in the parent folder and all the children folders
 * @param {string} folderId - parent folder
 * @param {mimeType=} desiredType - type of files desired
 * @returns {Promise<Array.<{name,id,mimeType}>>} array of file objects where each object has the properties 
 * specified by the constant `FILE_META_FOR_FOLDER_SEARCH`
 */
const getFilesRecursively = async (folderId, desiredType = undefined) => {
  let result = [];
  const folderType = mimeType.getType(mimeType.FOLDER);
  const files = await getFilesInFolder(folderId, undefined);
  for (const entry of files) {
    if (entry.mimeType === folderType) {
      const subFolderFiles = await getFilesRecursively(entry.id, desiredType);
      result = result.concat(subFolderFiles);
    } else {
      if ((desiredType === undefined) || (entry.mimeType === mimeType.getType(desiredType))) {
        result.push(entry);
      }
    }
  }
  return result;
};


/**
 * Private helper function to look up the mimetype string for the passed enum and construct and "and" clause that
 * can be used in the API search query. The FILE enum isn't a type the API understands
 * but we use it to mean any type of file but NOT a folder. 
 * @protected
 * @param {mimeType=} type - enum for type of file 
 * @returns {string} the additional clause to limit the search for the specified type. For example if mimeType.SPREADSHEET 
 * was passed in  
 * ->  `and mimeType = application/vnd.google-apps.spreadsheet`  
 * will be returned.
 */
const getMimeTypeClause = (type) => {
  if (type === undefined) {
    return "";
  }

  if (type === mimeType.FILE) {
    return `and mimeType != '${mimeType.getType(mimeType.FOLDER)}'`;
  }
  return `and mimeType = '${mimeType.getType(type)}'`;
};


module.exports = {
  init,
  getFileByName,
  getFilesByName,
  getFileIdFromName,
  listFiles,
  countAllFiles,
  getFilesInFolder,
  getFileNamesInFolder,
  getFilesRecursively,
  mimeType,
};