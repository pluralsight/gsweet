
const chai = require('chai')
chai.should()
const sandbox = require('sinon').createSandbox()
const {google} = require('googleapis')
const authHelper = require('../googleAuthHelper')
const ds = require('./driveService')

// eslint-disable-next-line no-unused-vars
let driveStub
// eslint-disable-next-line no-unused-vars
let authHelperStub
const mockResponse = {service: 1}
const fakeService = {fake: 2}
describe('driveService module ', () => {
  // beforeEach ( () =>{});
  // afterEach ( () =>{});
  beforeEach(() => {
    driveStub = sandbox.stub(google, 'drive').returns(mockResponse)
    authHelperStub = sandbox.stub(authHelper, 'getGoogleDriveAuth')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('init() should  with no param should call google.drive', () => {
    it('call google.drive when no parameters are passed', () => {
      const result = ds.init()
      result.should.equal(mockResponse)
    })

    it('should just use passed value when parameter is passed', () => {
      const result = ds.init(fakeService)
      result.should.equal(fakeService)
    })
  })
})