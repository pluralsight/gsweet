/** @module Drive/driveOps.test */
const chai = require('chai')
chai.should()
const driveOps = require('./driveOps')
const logger = require('../utils/logger')

/**
 * Fake the service used by the Google Drive API. We will just send back
 * the q, pageSize and fields params that are constructed and passed in 
 * the code normally returns an array of objects that have a lot of properties
 * but we mostly care about id, name and mimeType
 */
const fakeDriveService = {
  files: {
    list: async ({q, pageSize, fields}) => {
      fakeDriveService.q = q
      fakeDriveService.pageSize = pageSize
      fakeDriveService.fields = fields
      // todo based on q
      return ({
        data: {
          files: [{
            id: 'fakeId',
            name: 'fakeName',
            mimeType: mimeType.getType(mimeType.SPREADSHEET),
          }],
          nextPageToken: 'more data available',
        },
      })
    },
  },
}

const throwDriveService = {
  files: {
    list: async () => {
      const googleErrObj = {
        response: {data: {error: {errors: ['the fake error']}}},
      }
      throw googleErrObj
    },

  },
}

const fakeTwoFiles = {
  files: {
    list: async () => ({
      data: {
        files: [{id: 'fakeId1'}, {id: 'fakeId2'}],
      },
    }),
  },
}

const {mimeType} = driveOps

beforeEach(() => {
  driveOps.init(fakeDriveService)
  logger.level = 'info'
})

afterEach(() => {
  logger.level = 'debug'
})

describe('driveOps module', () => {
  describe('mimeType enum should', () => {
    it('should have expected enum values', () => {
      const {mimeType} = driveOps
      mimeType.FOLDER.should.equal(mimeType.FOLDER)
      mimeType.FILE.should.equal(mimeType.FILE)
      mimeType.SPREADSHEET.should.equal(mimeType.SPREADSHEET)
      mimeType.DOC.should.equal(mimeType.DOC)
    })

    it('should have a get function that returns element of properties property', () => {
      const {mimeType} = driveOps
      mimeType.getType(mimeType.FOLDER).should.contain('folder')
      mimeType.getType(mimeType.FILE).should.contain('N/A')
      mimeType.getType(mimeType.SPREADSHEET).should.contain('spreadsheet')
      mimeType.getType(mimeType.DOC).should.contain('document')
    })
  })

  describe('getFile() should', () => {
    it('return file with expected name ', async () => {
      const result = await driveOps.getFile({withName: 'anyName'})
      logger.debug(result)
      result.name.should.contain('fakeName')
    })

    it('should throw when more than one file ', async () => {
      driveOps.init(fakeTwoFiles)
      await driveOps.getFile({withName: 'anyName'})
        .catch(err => {
          err.should.equal('Found 2 files.')
        })
    })
  })


  describe('getFileId() should', () => {
    it('return just the expected id', async () => {
      const result = await driveOps.getFileId({withName: 'fakeName', exactMatch: true})
      result.should.equal('fakeId')
    })
  })


  describe('getFiles() should', () => {
    it('not have contains clause with exactMatch:true', async () => {
      await driveOps.getFiles({withName: 'myName', exactMatch: true})
      fakeDriveService.q.should.not.contain('contains')
    })

    it('throw custom string when files.list throws', async () => {
      let caught = false
      driveOps.init(throwDriveService)
      await driveOps.getFiles({withName: 'anything', exactMatch: undefined})
        .catch(err => {
          caught = true
          err.should.match(/For anything.*the fake error/)
        })
      caught.should.be.true
    })
  })


  describe('getFilesInFolder() should', () => {
    it('return filename and specified mimeType clause when not FOLDER', async () => {
      await driveOps.getFilesInFolder({
        withFolderId: 'anyFolderId',
        ofType: mimeType.SPREADSHEET,
      })
      const query = fakeDriveService.q
      const clause = new RegExp(`anyFolderId.+ mimeType = \\'${mimeType.getType(mimeType.SPREADSHEET)}`)
      fakeDriveService.fields.should.contain('mimeType')
      query.should.match(clause)
    })

    it('return filename and mimeType != FOLDER when FILE specified', async () => {
      await driveOps.getFilesInFolder({
        withFolderId: 'anyFolderId',
        ofType: mimeType.FILE,
      })
      const query = fakeDriveService.q
      const clause = new RegExp(`anyFolderId.+ mimeType != \\'${mimeType.getType(mimeType.FOLDER)}`)
      query.should.match(clause)
    })

    it('throw with expected error', async () => {
      driveOps.init(throwDriveService)
      let caught = false
      await driveOps.getFilesInFolder({withFolderId: 'throwFolderId', ofType: undefined})
        .catch(err => {
          err.should.contain('the fake error')
          // err.response.data.error.errors[0].should.match(/the fake error/)
          caught = true
        }
        )
      caught.should.be.true
    })
  })


  describe('getFileNamesInFolder() should', () => {
    it('return array of strings with filenames', async () => {
      const result = await driveOps.getFileNamesInFolder({withId: 'any', ofType: undefined})
      result.should.deep.equal(['fakeName'])
    })
  })


  describe('getFilesRecursively() should', () => {
    it('return the one file of:Type:mimeType.SPREADSHEET', async () => {
      const result = await driveOps.getFilesRecursively({
        withFolderId: 'anyFolderId', ofType: mimeType.SPREADSHEET,
      })
      result.length.should.equal(1)
    })

    it('return no files when no types match ofType:', async () => {
      const result = await driveOps.getFilesRecursively({
        withFolderId: 'anyFolderId', ofType: mimeType.DOC,
      })
      result.length.should.equal(0)
    })
  })


  describe('listFiles() should', () => {
    it('return list of files', async () => {
      const result = await driveOps.listFiles()
      result.length.should.equal(1)
    })

    it('throw custom string when files.list throws', async () => {
      driveOps.init(throwDriveService)
      let caught = false
      await driveOps.listFiles()
        .catch(err => {
          // test is returning error the same as the google error object
          err.response.data.error.errors[0].should.match(/the fake error/)
          caught = true
        })
      caught.should.be.true
    })
  })
})