/** @module Drive/driveOps.test */
const chai = require("chai");
chai.should();
const ds = require("./driveService");
const driveOps = require("./driveOps");


/**
 * Fake the service used by the Google Drive API. We will just send back
 * the q, pageSize and fields params that are constructed and passed in 
 * the code normally returns an array of objects that have a lot of properties
 * but we mostly care about id, name and mimeType
 */
// const fakeDriveservice = {
//   files: {
//     list: async ({q, pageSize, fields}) => ({
//       testEcho: {
//         q,
//         pageSize,
//         fields,
//       },
//       data: {
//         files: [{id: "fakeId", name: "fakeName", mimeType: "fakeMimeType"}],
//       },
//     }),
//   }
// };

const fakeDriveService = {
  files: {
    list: async ({q, pageSize, fields}) => {
      // console.log(q, pageSize, fields);
      fakeDriveService.q = q;
      fakeDriveService.pageSize = pageSize;
      fakeDriveService.fields = fields;
      // todo based on q
      return ({
        testEcho: {
          q,
          pageSize,
          fields,
        },
        data: {
          files: [{id: "fakeId", name: "fakeName", mimeType: "fakeMimeType"}],
        },
      });
    },
  }
};

const {mimeType} = driveOps;

before(() => {
  const fakeService = ds.init(fakeDriveService);
  driveOps.init(fakeService);
});

describe.only("name or description of test", () => {

  it("getFileByName() ", async () => {
    const result = await driveOps.getFileByName("anyName");
    console.log(result);
    true.should.be.true;
  });

  it.only("getFilesInFolder()", async () => {
    const result = await driveOps.getFilesInFolder("anyName", mimeType.SPREADSHEET);
    console.log(result);
    console.log(fakeDriveService.fields);
    true.should.be.true;
  });
});