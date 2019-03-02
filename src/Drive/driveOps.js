const logger = require("../utils/logger");
let _driveService;

const MAX_FILES_PER_PAGE = 10;

const mimeType = {
  FOLDER: 1,
  FILE: 2,
  SPREADSHEET: 3,
  DOC: 4,
  properties: {
    1: {type: "application/vnd.google-apps.folder"},
    2: {type: "N/A"},
    3: {type: "application/vnd.google-apps.spreadsheet"},
    4: {type: "application/vnd.google-apps.document"},
  },
  getType: (value) => mimeType.properties[value].type,
};
// see https://developers.google.com/drive/api/v3/mime-types  for all the types


const init = (driveService) => {
  _driveService = driveService;
};

const getFileIdFromName = async (filename) => {
  const file = await getFileByName(filename);
  return file.id;
};

const getFileByName = async (filename) => {
  const files = await getFilesByName(filename);
  if (files.length != 1) {
    throw (`Found ${files.length} files.`);
  }
  return files[0];
};

const getFilesByName = async (filename) => {
  const response = await _driveService.files.list(
    {
      q: `name='${filename}'`,
      pageSize: MAX_FILES_PER_PAGE,
      fields: "nextPageToken, files(id, name)",
    })
    .catch(error => {
      throw (`\r\nFor ${filename} - The Google Drive API returned:${error}`);
    });
  const {files} = response.data;
  return files;
};

const listFiles = async () => {
  const response = await _driveService.files.list({
    pageSize: 10,
    fields: "files(id,name)",
  })
    .catch(error => {throw (error);});

  return response.data.files;
};

const getFilesInFolderId = async (folderId, mimeType = undefined) => {
  const mimeClause = getMimeTypeClause(mimeType);
  const response = await _driveService.files.list(
    {
      q: `parents in '${folderId}' ${mimeClause}`,
      // pageSize: MAX_FILES_PER_PAGE,
      fields: "nextPageToken, files(id, name, mimeType)",
    })
    .catch(error => {
      throw (`\r\nFor parent folder ${folderId} - files.list() returned:${error}`);
    });
  const {files} = response.data;
  return files;
};

const getFilesRecursively = async (folderId, desiredType = undefined) => {
  let result = [];
  const folderType = mimeType.getType(mimeType.FOLDER);
  const files = await getFilesInFolderId(folderId, undefined);
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

const getChildren = async (folderId) => {
  const response = await _driveService.children.list(
    {
      folderId,
    })
    .catch(error => {
      throw (`\r\nFor parent folder ${folderId} - children.list() returned:${error}`);
    });
  return response.data.files;
};

const getMimeTypeClause = (type) => {
  if (type === undefined) {
    return "";
  }

  if (type === mimeType.FILE) {
    return `and mimeType != '${mimeType.properties[mimeType.FOLDER].type}'`;
  }
  return `and mimeType = '${mimeType.properties[type].type}'`;
};

module.exports = {
  init,
  getFileByName,
  getFilesByName,
  getFileIdFromName,
  listFiles,
  getFilesInFolderId,
  getFilesRecursively,
  getChildren,
  MAX_FILES_PER_PAGE,
  mimeType,
};