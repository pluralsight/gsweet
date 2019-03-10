// @ts-check
/** @module */
/**
 * @file Handles talking to the Google Spreadsheet API 
 *  ## Links to Google Drive documentation   
 * [mime-types](https://developers.google.com/drive/api/v3/mime-types)   
 * [all file meta data](https://developers.google.com/drive/api/v3/reference/files)   
 * [search parameters](https://developers.google.com/drive/api/v3/search-parameters)   
 * a few meta types we aren't using that might be interesting are `starred, shared, description`
 *   
 * NOTE: Before using init() **MUST** be called and a driveService passed in.  
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later [Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 */
const ds = require("./driveService")


const logger = require("../utils/logger")

const MAX_FILES_PER_PAGE = 1000
let _driveService

/** Enum for the currently supported google mime-types */
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
  // getType(value) {return this.properties[value].type},
  getType: (value) => mimeType.properties[value].type,
}

const FILE_META_FOR_NAME_SEARCH = "files(id, name)"
const FILE_META_FOR_FOLDER_SEARCH = "files(id, name, mimeType)"

/** Allow access to google drive APIs via the driveService (this version for testing) */
const init = (driveService) => {
  _driveService = driveService
}

/** In production just call this to set up access to the drive APIs */
const autoInit = () => {
  _driveService = ds.init()
}

/**
 * Get a list of files/folders that match  
 * @param   {{withName:String,exactMatch:Boolean}} fileOptions
  * @returns {Promise<Array.<{id:String,name:String}>>}  
  * @example getFiles({withName:"someName", exactMatch:true})
 */
const getFiles = async (fileOptions) => {
  const {withName} = fileOptions
  const {exactMatch} = fileOptions
  // NOTE: The filename has to be quoted  
  const query = `name ${exactMatch ? " = " : "contains"} '${withName}'`
  const response = await _driveService.files.list(
    {
      q: query,
      pageSize: MAX_FILES_PER_PAGE,
      fields: `nextPageToken, ${FILE_META_FOR_NAME_SEARCH}`,
    })
    .catch(googleError => {
      const {errors} = googleError.response.data.error
      const errMsg = JSON.stringify(errors[0], null, 2)
      logger.error(errMsg)
      throw (`For ${withName} - The Google Drive API returned:${errMsg}`)
    })
  const {files} = response.data
  return files
}

/**
 * Get a single file for the passed name. If a single file isn't found an error is thrown.  
// @ts-ignore
 * @param {{withName:String}} withName
 * @returns {Promise<{id:String,name:String}>}  a single object that has the FILE_META_FOR_NAME_SEARCH properties
 * @example getFile({withName:"someName"})
 */
const getFile = async ({withName}) => {
  const files = await getFiles({withName, exactMatch: true})
  if (files.length !== 1) {
    throw (`Found ${files.length} files.`)
  }
  return files[0]
}


/**
 * Convenience function that returns the id for a file  
 * @param {{withName:String,exactMatch:Boolean}} withNameObj
 * @returns {Promise<string>} google id for the file
 * @example getFileId({withName:"SomeName"})
 *  */
const getFileId = async (withNameObj) => {
  const file = await getFile(withNameObj)
  return file.id
}

/**
 * Just get the files for the user. Will only return the google API max
 * of 1000 files.  
 * @returns {Promise<Array.<{FILE_META_FOR_FOLDER_SEARCH}>>} array of objects, where each object
 * has the properties specified by the constant `FILE_META_FOR_FOLDER_SEARCH`
  * @example listFiles()
  * */
const listFiles = async () => {
  const response = await _driveService.files.list({
    fields: `${FILE_META_FOR_FOLDER_SEARCH}`,
    pageSize: MAX_FILES_PER_PAGE,
  })
    .catch(error => {throw (error)})

  return response.data.files
}


/**
 * Example of how to use the nextPageToken to get all the files
 * in a folder when there are more than 1000
 */
// const countAllFiles = async () => {
//   let nextPage = null // start on first page
//   let totalCount = 0
//   do {
//     const response = await _driveService.files.list({
//       pageToken: nextPage,
//       fields: `nextPageToken, ${FILE_META_FOR_FOLDER_SEARCH}`,
//       pageSize: MAX_FILES_PER_PAGE,
//     })
//       .catch(error => {
//         logger.error(JSON.stringify(error))
//       })
//     nextPage = response.data.nextPageToken
//     if (response.data.files !== undefined) {
//       totalCount += response.data.files.length
//     }

//     logger.debug(nextPage)
//   } while (nextPage !== undefined && totalCount < 20000)
//   logger.info(`Total file count: ${totalCount}`)
// }


/**
 * Get all the Files in the passed folderId   (ofType is optional)  
 * @param {{withFolderId:String,ofType:any}} folderOptions
 * @returns {Promise<Array<{name, id, mimeType}>>} array of file objects where each object has the properties
 * specified by the constant `FILE_META_FOR_FOLDER_SEARCH`
 * @example getFilesInFolder({withFolderId:"someId", ofType:mimeType:SPREADSHEET})
 */
const getFilesInFolder = async (folderOptions) => {
  const {withFolderId} = folderOptions
  const {ofType} = folderOptions
  const mimeClause = getMimeTypeClause(ofType)
  const response = await _driveService.files.list(
    {
      q: `parents in '${withFolderId}' ${mimeClause}`,
      pageSize: MAX_FILES_PER_PAGE,
      fields: `nextPageToken, ${FILE_META_FOR_FOLDER_SEARCH}`,
    })
    .catch(error => {
      const errMsg = JSON.stringify(error, null, 2)
      throw (`\r\nFor parent folder ${withFolderId} - files.list() returned:${errMsg}`)
    })
  const nextToken = response.data.nextPageToken
  if (nextToken !== undefined) {
    logger.debug(`NEXT PAGE TOKEN ${response.data.nextPageToken}`)
  }

  const {files} = response.data
  return files
}


/**
 * Get just the names of the files in the folder (ofType is optional)  
 * @param {{withFolderId:String,ofType:number}} folderOptions
 * @returns {Promise<Array.<string>>} array of strings containing filenames
 * @example getFileNamesInFolder({withFolderId:"someId", ofType:mimeType.SPREADSHEET)
 */
const getFileNamesInFolder = async (folderOptions) => {
  const files = await getFilesInFolder(folderOptions)
  return files.map(e => e.name)
}


/**
 * Get the files in the parent folder and all the children folders (ofType is optional)  
 * @param {{withFolderId:String,ofType:number}} folderOptions
 * @returns {Promise<Array.<{FILE_META_FOR_FOLDER_SEARCH}>>} array of file objects where each object has the properties 
 * specified by the constant `FILE_META_FOR_FOLDER_SEARCH` 
 * @example getFilesRecursively({withFolderId:"someId", ofType:mimeType.SPREADSHEET})
 */
const getFilesRecursively = async (folderOptions) => {
  let result = []
  const {ofType} = folderOptions
  const {withFolderId} = folderOptions
  const folderType = mimeType.getType(mimeType.FOLDER)
  const allTypes = {withFolderId, ofType: undefined}
  const files = await getFilesInFolder(allTypes)
  for (const entry of files) {
    if (entry.mimeType === folderType) {
      const subFolderFiles = await getFilesRecursively({withFolderId: entry.id, ofType})
      result = result.concat(subFolderFiles)
    } else {
      if ((ofType === undefined) || (entry.mimeType === mimeType.getType(ofType))) {
        result.push(entry)
      }
    }
  }
  return result
}


/**
 * Private helper function to look up the mimetype string for the passed enum and construct and "and" clause that
 * can be used in the API search query. The FILE enum isn't a type the API understands
 * but we use it to mean any type of file but NOT a folder.   
* @param {number} type
 * @returns {string} the additional clause to limit the search for the specified type. 
 * For example if mimeType.SPREADSHEET was passed in, then the clause  
 * will be returned.
 * @example getMimeTypeClause(mimeType.SPREADSHEET) will return `and mimeType = application/vnd.google-apps.spreadsheet`
 */
const getMimeTypeClause = (type) => {
  if (type === undefined) {
    return ""
  }

  if (type === mimeType.FILE) {
    return `and mimeType != '${mimeType.getType(mimeType.FOLDER)}'`
  }
  return `and mimeType = '${mimeType.getType(type)}'`
}


module.exports = {
  autoInit,
  init,
  getFile,
  getFiles,
  getFileId,
  listFiles,
  getFilesInFolder,
  getFileNamesInFolder,
  getFilesRecursively,
  mimeType,
}