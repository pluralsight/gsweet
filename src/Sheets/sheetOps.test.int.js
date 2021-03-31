/**
 * @module Sheet/sheetOps Integration Tests
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 */
const chai = require('chai')
const should = chai.should()
const Gsweet = require('../main')
const logger = require('../utils/logger')
const testData = require('../test-data/integration.json')
const testSheet = testData.sheet
const {destSheet} = testData
// Link to test sheet
// https://docs.google.com/spreadsheets/d/105LhrjQp75T4Q4mZ337ydosno6tjKjDzXNutXf24c1c/edit#gid=0
// Link to dest sheet
// https://docs.google.com/spreadsheets/d/1pLB4AmPpInCpHy3A_lCwqWkt2jc_itif3gNMyhIy4Do/edit#gid=0

const gsweet = new Gsweet({
  pathOrVarName: '/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json',
  useExistingEnvVar: false,
})
const {sheetOps, sheetFormatOps} = gsweet

before(() => {
  logger.level = 'info'
})
after(() => {
  logger.level = 'debug'
})

/** @see sheetOps module */
describe('INTEGRATION TESTS sheetOps module', function() {
  this.timeout(10000)
  const SINGLE_CELL = `${testSheet.tabName}!C1`
  const sheetRange = {}

  beforeEach(() => {
    sheetRange.id = testSheet.id
    sheetRange.range = `${testSheet.tabName}!A1`
    sheetRange.value = ''
    sheetRange.data = [['Row1Test'], ['Row2Test']]
  })

  describe('setRangeData() should', () => {
    it('set a single value when passed a [[oneItem]] 2D array', async () => {
      sheetRange.data = [['Row1TestMe']]
      const result = await sheetOps.setRangeData(sheetRange)
      result.data.updatedCells.should.equal(1)
    })

    it('set multiple rows in a single column', async () => {
      const result = await sheetOps.setRangeData(sheetRange)
      result.data.updatedCells.should.equal(2)
    })

    it('set multiple columns and rows ', async () => {
      sheetRange.data = [
        ['Row1Col1Test', 'Row1Col2Test'],
        ['Row2Col1Test', 'Row2Col2Test']
      ]
      const result = await sheetOps.setRangeData(sheetRange)
      const expected = [].concat(...sheetRange.data).length
      result.data.updatedCells.should.equal(expected)
    })

    it('not overwrite cells that align to empty cells in a sparse array', async () => {
      sheetRange.data = [[], ['Row2Col1Test', 'Row2Col2Test']]
      const result = await sheetOps.setRangeData(sheetRange)
      result.data.updatedCells.should.equal(2)
    })
  })

  describe('setSheetCell() should', () => {
    it('set a single value by just passing in the value in sheetRange.value property', async () => {
      sheetRange.range = SINGLE_CELL
      const result = await sheetOps.setSheetCell(sheetRange)
      result.data.updatedCells.should.equal(1)
    })
  })

  describe('getSheetValues() should', () => {
    beforeEach(() => {
      sheetRange.range = `${testSheet.tabName}!A1:C2`
    })
    const setTestData = async data => {
      sheetRange.data = data
      await sheetOps.setRangeData(sheetRange)
      return [].concat(...data).length
    }

    it('return a single value for a range that is one cell', async () => {
      sheetRange.value = 'oneValue'
      sheetRange.range = SINGLE_CELL
      await sheetOps.setSheetCell(sheetRange)
      const result = await sheetOps.getSheetValues(sheetRange)
      result[0][0].should.equal(sheetRange.value)
    })

    it('return multiple values, one for each cell with data in range', async () => {
      const data = [[1, 2, 3], [4, 5, 6]]
      const expectedNumCells = await setTestData(data)
      const result = await sheetOps.getSheetValues(sheetRange)
      const numCells = [].concat(...result).length
      numCells.should.equal(expectedNumCells)
    })

    it('return a shortened array when a row ends with a blank cell', async () => {
      const data = [[1, 2, ''], [4, 5, 6]]
      const expectedNumCells = await setTestData(data)
      const result = await sheetOps.getSheetValues(sheetRange)
      const numCells = [].concat(...result).length
      numCells.should.equal(expectedNumCells - 1)
    })

    it('return a full array when a row has a blank cell in the middle', async () => {
      const data = [[1, '', 3], [4, 5, 6]]
      const expectedNumCells = await setTestData(data)
      const result = await sheetOps.getSheetValues(sheetRange)
      const numCells = [].concat(...result).length
      numCells.should.equal(expectedNumCells)
    })

    it('return a shortened array when the final row has no data ', async () => {
      const data = [[1, '', 3], ['', '', '']]
      await setTestData(data)
      const result = await sheetOps.getSheetValues(sheetRange)
      should.not.exist(result[1])
    })
  })

  describe('Meta Data functions', () => {
    beforeEach(() => {})
    it('getSheetProperties() should return some meta data.', async () => {
      const result = await sheetOps.getSheetProperties(sheetRange.id)
      result.data.sheets.should.exist
    })

    it('getSheetGridProperties() with good index should return grid data', async () => {
      const sheetInfo = {sheetId:sheetRange.id, sheetIndex:0}
      const result = await sheetOps.getSheetGridProperties(sheetInfo)
      result.isValid.should.be.true
      result.message.should.equal('')
    })
    it('getSheetGridProperties() with bad index should return error', async () => {
      const sheetInfo = {sheetId:sheetRange.id, sheetIndex:10}
      const result = await sheetOps.getSheetGridProperties(sheetInfo)
      result.isValid.should.be.false
      result.message.should.contain('Error')
    })

    it('getSheetGridProperties() with good sheet name should return grid data', async () => {
      const sheetInfo = {sheetId:sheetRange.id, sheetName:testSheet.tabName}
      const result = await sheetOps.getSheetGridProperties(sheetInfo)
      result.message.should.equal('')
      result.isValid.should.be.true
    })

    it('getSheetGridProperties() with bad sheet name should return grid data', async () => {
      const sheetInfo = {sheetId:sheetRange.id, sheetName:'NonexistentSheetName'}
      const result = await sheetOps.getSheetGridProperties(sheetInfo)
      result.message.should.contain('Error')
      result.isValid.should.be.false
    })
  })

  it('getSheetIdByName() should use sheet name to get index', async () => {
    const sheetName = 'Sheet2'
    const findSheet = await sheetOps.getSheetIdByName({sheetId:sheetRange.id, sheetName})
    findSheet.isValid.should.be.true
    findSheet.sheetId.should.equal(898926069)
  })

  it('getSheetByName() should find and return a sheet', async () => {
    const sheetName = 'Sheet2'
    const findSheet = await sheetOps.getSheetByName({spreadsheetId:sheetRange.id, sheetName})
    findSheet.isValid.should.be.true
  })

  describe('copySheetFromTo() should ', () => {
    it('copy a test sheet', async () => {
      const sheetName = 'Sheet1'
      const foundSheet = await sheetOps.getSheetIdByName({sheetId:sheetRange.id, sheetName})
      foundSheet.sheetId.should.equal(0)
  
      const result = await sheetOps.copySheetFromTo({fromSpreadsheetId:sheetRange.id, 
        fromSheetId:foundSheet.sheetId,
        toSpreadsheetId: destSheet.id})
      result.success.should.be.true
    })

  
    it.skip('copySheetByNameFromTo() should copy both sheets from the IP Template', async () => {
      const result = await sheetOps.copySheetByNameFromTo({fromSpreadsheetId:'1tWjA_JrIH480II4itMu1H6q20AMc3QO6k03OJOKzl0M', 
        fromSheetName:'Data Validation',
        toSpreadsheetId: destSheet.id})
      result.success.should.be.true
      const result2 = await sheetOps.copySheetByNameFromTo({fromSpreadsheetId:'1tWjA_JrIH480II4itMu1H6q20AMc3QO6k03OJOKzl0M', 
        fromSheetName:'Course Plan',
        toSpreadsheetId: destSheet.id})
      result2.success.should.be.true
    })


    it.skip('DEBUGGING TEST: copy Data Entry/Data Validation test sheets', async () => {
      // Link to test source sheet
      // https://docs.google.com/spreadsheets/d/1r8CtuoJKEQLhZXQvcG7THGxGlRvJabMAFWIbYEB2pQY/edit#gid=0
      // Link to test destination sheet
      // https://docs.google.com/spreadsheets/d/1T6AjEMs3goccHvt54ecoXdrkESCdx3xH7LFxvL9TGcI/edit#gid=0
      const tempDestSheetId = '1T6AjEMs3goccHvt54ecoXdrkESCdx3xH7LFxvL9TGcI'
      let  result = await sheetOps.copySheetFromTo({
        fromSpreadsheetId:'1r8CtuoJKEQLhZXQvcG7THGxGlRvJabMAFWIbYEB2pQY', 
        fromSheetId:0, // The Data Entry Sheet
        toSpreadsheetId: tempDestSheetId})

      result.success.should.be.true
      result = await sheetOps.copySheetFromTo({
        fromSpreadsheetId:'1r8CtuoJKEQLhZXQvcG7THGxGlRvJabMAFWIbYEB2pQY', 
        fromSheetId:1105675139, // The Data Validation Sheet
        toSpreadsheetId: tempDestSheetId})
      const dataValidationSheetId = result.sheetId
      result.success.should.be.true

      // NOTE  This is a troubleshooting test. It will only work once. After that
      // the rename will fail because the destination sheet will have a sheet with this name. 
      result = await sheetFormatOps.renameSheet({
        id:tempDestSheetId,
        newName:'Data Validation', 
        sheetId: dataValidationSheetId})

    })
  })
  describe('Data Validation ',   () => {
    it('setListDataValidation() should set up a list dropdown', async () => {
      const valuesList = ['Scalzi', 'Hearne', 'Rothfuss']
      
      const result = await sheetOps.setListDataValidation({
        spreadsheetId: destSheet.id,
        sheetId: 0,
        rcInfo:{row:1, col:1, numCols:1},
        valuesList,
      })

    })
  })
})
