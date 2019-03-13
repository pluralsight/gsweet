const chai = require('chai')
chai.should()
const sandbox = require('sinon').createSandbox()
const {google} = require('googleapis')
const authHelper = require('../googleAuthHelper')
const ss = require('./sheetService')

// eslint-disable-next-line no-unused-vars
let sheetStub
// eslint-disable-next-line no-unused-vars
let authHelperStub
const mockResponse = {service: 1}
const fakeService = {fake: 2}
describe('sheetService module ', () => {
  // beforeEach ( () =>{});
  // afterEach ( () =>{});
  beforeEach(() => {
    sheetStub = sandbox.stub(google, 'sheets').returns(mockResponse)
    authHelperStub = sandbox.stub(authHelper, 'getGoogleSheetAuth')
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('init() should  with no param should call google.sheets', () => {
    it('call google.sheets when no parameters are passed', () => {
      const result = ss.init()
      result.should.equal(mockResponse)
    })

    it('should just use passed value when parameter is passed', () => {
      const result = ss.init(fakeService)
      result.should.equal(fakeService)
    })
  })
})