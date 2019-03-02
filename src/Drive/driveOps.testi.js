const chai = require("chai");
chai.should();
const ds = require("./driveService");
const driveOps = require("./driveOps");

const TEST_FILE = "node integration test file";
const NO_FILES = "a long name that should n-o-t exist in google drive";
const MULTIPLE_FILES = "Untitled spreadsheet";
const NODE_TEST_FOLDER_ID = "1SetfeHTL-ArgyDxsQkyFYUbZxGOnTDhB";
const MIN_GOOGLE_ID_LENGTH = 10;

describe("INTEGRATION TEST driveOps module", function () {
  this.timeout(5000);
  const {mimeType} = driveOps;
  const FOLDER_TYPE = mimeType.getType(mimeType.FOLDER);
  const SPREADSHEET_TYPE = mimeType.getType(mimeType.SPREADSHEET);

  const driveService = ds.init();
  driveOps.init(driveService);

  it("fileList() should return MAX_FILES_PER_PAGE files", async () => {
    const fileList = await driveOps.listFiles();
    fileList.length.should.equal(driveOps.MAX_FILES_PER_PAGE);
  });
  describe("getFileIdFromName()", () => {

    it("should get the TEST_FILE id", async () => {
      const id = await driveOps.getFileIdFromName(TEST_FILE);
      id.length.should.be.above(MIN_GOOGLE_ID_LENGTH);
    });
  });

  it("getFilesByName() should return up to MAX_FILES with given name", async () => {
    const files = await driveOps.getFilesByName(MULTIPLE_FILES);
    files.length.should.equal(driveOps.MAX_FILES_PER_PAGE);
  });

  describe("getFileByName()", () => {
    it("should return the TEST_FILE id and name", async () => {
      const file = await driveOps.getFileByName(TEST_FILE);
      file.id.length.should.be.above(MIN_GOOGLE_ID_LENGTH);
      file.name.length.should.equal(TEST_FILE.length);
    });

    it("should reject when no files are found", async () => {
      await driveOps.getFileByName(NO_FILES)
        .catch(error => {
          error.should.contain("Found 0 files");
        });
    });

    it("should reject when multiple files are found", async () => {
      await driveOps.getFileByName(MULTIPLE_FILES)
        .catch(error => {
          error.should.match(/Found \d+ files.*/);
        });
    });
  });

  describe("getFilesInFolderId()", () => {
    it("should return some files in NODE_TEST_FOLDER_ID", async () => {
      const files = await driveOps.getFilesInFolderId(NODE_TEST_FOLDER_ID);
      files.length.should.be.above(0);
    });

    it.only("should find just files (not folders)", async () => {
      const files = await driveOps.getFilesInFolderId(NODE_TEST_FOLDER_ID, mimeType.FILE);
      files.forEach(entry => {
        entry.mimeType.should.not.equal(FOLDER_TYPE);
      });
    });

    it.only("should find just spreadsheets", async () => {
      const files = await driveOps.getFilesInFolderId(NODE_TEST_FOLDER_ID, mimeType.SPREADSHEET);
      files.forEach(entry => {
        entry.mimeType.should.equal(SPREADSHEET_TYPE);
      });

    });
  });


});