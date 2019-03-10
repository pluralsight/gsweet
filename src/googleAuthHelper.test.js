/* eslint-disable camelcase */
const chai = require("chai")
chai.should()
const googleAuth = require("google-auth-library")
const sandbox = require("sinon").createSandbox()
const authHelper = require("./googleAuthHelper")

describe("googleAuthHelper", () => {
  const fakeCreds = {
    client_secrets: {
      installed: {
        client_secret: "secret",
        client_id: "fake_id",
        redirect_urls: ["local.host"],
      },
    },
    sheet_credentials: "",
    drive_credentials: "",
  }
  // const gsweetEnv = `{"client_secrets":"${mt}","sheet_credentials":"","drive_credentials":""}`
  const gsweetEnv = JSON.stringify(fakeCreds)
  const mockedResponse = {credentials: "authorized"}

  beforeEach(() => {
    sandbox.stub(googleAuth, "OAuth2Client").returns(mockedResponse)
    process.env["gsweet"] = gsweetEnv
  })

  afterEach(() => {
    sandbox.restore()
    delete process.env.gsweet
  })

  it("getGoogleSheetAuth should return object with credentials", () => {
    const result = authHelper.getGoogleSheetAuth()
    result.should.haveOwnProperty("credentials")
  })
  it("getGoogleDriveAuth should return object with credentials", () => {
    const result = authHelper.getGoogleDriveAuth()
    result.should.haveOwnProperty("credentials")
  })

  it("getGooleDriveAuth should throw if no process.env.gsweet", () => {
    process.env.gsweet = undefined
    authHelper.forceInitialization()
    authHelper.getGoogleDriveAuth.bind().should.throw()
  })
})