let _driveService;

const init = (driveService) => {
  _driveService = driveService;
};

const driveGetFileIdFromName = async (filename) => {
  const file = await driveGetFileByName(filename);
  return file.id;
};

const driveGetFileByName = async (filename) => {

  return new Promise((resolve, reject) => {
    _driveService.files.list(
      {
        q: `name='${filename}'`,
        pageSize: 10,
        fields: "nextPageToken, files(id, name)",
      },
      (err, response) => {
        if (err) {
          return reject(`\r\nFor ${filename} - The Google Drive API returned:${err}`);
        }
        const {files} = response.data;
        if (files.length != 1) {
          return reject(`Found ${files.length} files.`);
        }
        return resolve(files[0]);
      }
    );
  });
};

const listFiles = async () => new Promise((resolve, reject) => {
  _driveService.files.list({
    pageSize: 10,
    fields: "files(id,name)"
  },
    (err, response) => {
      if (err) {
        return reject("failed");
      }
      return resolve(response.data.files);
    });
});

module.exports = {
  init,
  driveGetFileByName,
  driveGetFileIdFromName,
  listFiles,
};