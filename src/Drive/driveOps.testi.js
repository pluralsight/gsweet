/**
 * @module Drive/driveOps Integration Tests
 */
const chai = require("chai")
const should = chai.should()

require("env-create").load({
  path: "/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json",
  debug: "true",
})
const ds = require("./driveService")
const driveOps = require("./driveOps")
const logger = require("../utils/logger")
const testData = require("../test-data/integration")
const testDrive = testData.drive

const NO_FILES = "a long name that should n-o-t exist in google drive"
const UNTITLED_SPREADSHEET = testDrive.untitledSheet
const COMMON_PART_NAME = testDrive.nameContainedMaxFilesTimes

const MIN_GOOGLE_ID_LENGTH = 10
const MAX_FILES_PER_QUERY = 1000

before(() => {logger.level = "info"})
after(() => {logger.level = "debug"})

describe.only("INTEGRATION TEST driveOps module", function () {
  this.timeout(10000)
  const {mimeType} = driveOps
  const FOLDER_TYPE = mimeType.getType(mimeType.FOLDER)
  const SPREADSHEET_TYPE = mimeType.getType(mimeType.SPREADSHEET)

  const driveService = ds.init()
  driveOps.init(driveService)

  it("fileList() should return MAX_FILES_PER_QUERY files", async () => {
    const fileList = await driveOps.listFiles()
    fileList.length.should.equal(MAX_FILES_PER_QUERY)
  })

  describe("getFiles() should", () => {
    it("return multiple UNTITLED_SPREADSHEET files", async () => {
      const files = await driveOps.getFiles({withName: UNTITLED_SPREADSHEET})
      files.length.should.be.above(1)
    })

    it("return the MAX_FILES_PER_QUERY for PLURALSIGHT_FILES", async () => {
      const files = await driveOps.getFiles({withName: COMMON_PART_NAME, exactMatch: false})
      files.length.should.equal(MAX_FILES_PER_QUERY)
    })
  })

  describe("getFileId({withName}) should", () => {
    it("get the TEST_FILE id", async () => {
      const id = await driveOps.getFileId({withName: testDrive.sheetFile})
      id.length.should.be.above(MIN_GOOGLE_ID_LENGTH)
    })
  })

  describe("getFile({withName}) should", () => {
    it("should return the TEST_FILE id and name", async () => {
      const file = await driveOps.getFile({withName: testDrive.sheetFile})
      file.id.length.should.be.above(MIN_GOOGLE_ID_LENGTH)
      file.name.length.should.equal(testDrive.sheetFile.length)
    })

    it("reject when no files are found", async () => {
      await driveOps.getFile({withName: NO_FILES})
        .catch(error => {
          error.should.contain("Found 0 files")
        })
    })

    it("reject when multiple files are found", async () => {
      await driveOps.getFile({withName: UNTITLED_SPREADSHEET})
        .catch(error => {
          error.should.match(/Found \d+ files.*/)
        })
    })
  })

  describe("getFilesInFolder() should", () => {
    it("return some files in testDrive.folderId", async () => {
      const folderOptions = {withFolderId: testDrive.folderId}
      const files = await driveOps.getFilesInFolder(folderOptions)
      files.length.should.be.above(0)
    })

    it("find just files (not folders)", async () => {
      const folderOptions = {withFolderId: testDrive.folderId, ofType: mimeType.FILE}
      const files = await driveOps.getFilesInFolder(folderOptions)
      files.forEach(entry => {
        entry.mimeType.should.not.equal(FOLDER_TYPE)
      })
    })

    it("find just spreadsheets", async () => {
      const folderOptions = {withFolderId: testDrive.folderId, ofType: mimeType.SPREADSHEET}
      const files = await driveOps.getFilesInFolder(folderOptions)
      files.forEach(entry => {
        entry.mimeType.should.equal(SPREADSHEET_TYPE)
      })
    })
  })

  describe("GetFileNamesInFolder() should", () => {
    it("return just the names", async () => {
      const names = await driveOps.getFileNamesInFolder({withFolderId: testDrive.folderId})
      Array.isArray(names).should.be.true
    })
  })

  describe("GetFilesRecursively() should", () => {
    it("find files at root and subfolder ", async () => {
      const files = await driveOps.getFilesRecursively({withFolderId: testDrive.folderId})
      files.find(e => e.name === testDrive.subfolder).should.not.be.undefined
      files.find(e => e.name === testDrive.sheetFile).should.not.be.undefined
      files.find(e => e.name === testDrive.docFile).should.not.be.undefined
      files.find(e => e.name === testDrive.subfolderSheet).should.not.be.undefined
      files.find(e => e.name === testDrive.subfolderDoc).should.not.be.undefined
    })

    it("find spreadsheet files only at root and subfolder ", async () => {
      const files = await driveOps.getFilesRecursively({withFolderId: testDrive.folderId, ofType: mimeType.SPREADSHEET})
      files.find(e => e.name === testDrive.subfolder).should.not.be.undefined
      files.find(e => e.name === testDrive.sheetFile).should.not.be.undefined
      files.find(e => e.name === testDrive.subfolderSheet).should.not.be.undefined
      should.not.exist(files.find(e => e.name === testDrive.docFile))
      should.not.exist(files.find(e => e.name === testDrive.subfolderDoc))
    })
  })
})