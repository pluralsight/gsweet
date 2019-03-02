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
      throw (`\r\nFor parent folder ${folderId} - The Google Drive API returned:${error}`);
    });
  const {files} = response.data;
  return files;
};

const getMimeTypeClause = (type) => {
  if (mimeType === undefined) {
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
  MAX_FILES_PER_PAGE,
  mimeType,
};