/** @module Drive/driveOps.test */
const chai = require("chai")
chai.should()
const ds = require("./driveService")
const driveOps = require("./driveOps")
const logger = require("../utils/logger")

/**
 * Fake the service used by the Google Drive API. We will just send back
 * the q, pageSize and fields params that are constructed and passed in 
 * the code normally returns an array of objects that have a lot of properties
 * but we mostly care about id, name and mimeType
 */
const fakeDriveService = {
  files: {
    list: async ({q, pageSize, fields}) => {
      // console.log(q, pageSize, fields);
      fakeDriveService.q = q
      fakeDriveService.pageSize = pageSize
      fakeDriveService.fields = fields
      // todo based on q
      return ({
        data: {
          files: [{
            id: "fakeId",
            name: "fakeName",
            mimeType: mimeType.getType(mimeType.SPREADSHEET),
          }],
        },
      })
    },
  },
}

const {mimeType} = driveOps

before(() => {
  const fakeService = ds.init(fakeDriveService)
  driveOps.init(fakeService)
  logger.level = "info"
})

after(() => {
  logger.level = "debug"
})

describe("driveOps module", () => {
  it("getFile() should return file with expected name ", async () => {
    const result = await driveOps.getFile({withName: "anyName"})
    logger.debug(result)
    result.name.should.contain("fakeName")
  })

  it("getFiles() with exactMatch:true should not have contains clause", async () => {
    await driveOps.getFiles({withName: "myName", exactMatch: true})
    fakeDriveService.q.should.not.contain("contains")
  });

  describe("getFilesInFolder() should", () => {
    it("return filename and specified mimeType clause when not FOLDER", async () => {
      const result = await driveOps.getFilesInFolder({
        withFolderId: "anyFolderId",
        ofType: mimeType.SPREADSHEET,
      })
      const query = fakeDriveService.q
      const clause = new RegExp(`anyFolderId.+ mimeType = \\'${mimeType.getType(mimeType.SPREADSHEET)}`)
      fakeDriveService.fields.should.contain("mimeType")
      query.should.match(clause)
    })
  })

  it("return filename and mimeType != FOLDER when FILE specified", async () => {
    await driveOps.getFilesInFolder({
      withFolderId: "anyFolderId",
      ofType: mimeType.FILE,
    })
    logger.debug(fakeDriveService.q)
    const query = fakeDriveService.q
    const clause = new RegExp(`anyFolderId.+ mimeType != \\'${mimeType.getType(mimeType.FOLDER)}`)
    query.should.match(clause)
  })

  describe("getFilesRecursively() should", () => {
    it("return the one file of:Type:mimeType.SPREADSHEET", async () => {
      const result = await driveOps.getFilesRecursively({
        withFolderId: "anyFolderId", ofType: mimeType.SPREADSHEET,
      })
      result.length.should.equal(1)
    })

    it("return no files when no types match ofType:", async () => {
      const result = await driveOps.getFilesRecursively({
        withFolderId: "anyFolderId", ofType: mimeType.DOC,
      })
      result.length.should.equal(0)
    })
  })
})