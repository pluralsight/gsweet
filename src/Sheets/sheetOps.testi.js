/**
 * @module Sheet/sheetOps Integration Tests
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 */
const chai = require("chai");
const should = chai.should();
const ss = require("./sheetService");
const sheetOps = require("./sheetOps");
const logger = require("../utils/logger");

/** @see sheetOps module */
describe("INTEGRATION TESTS sheetOps module", function () {
  this.timeout(10000);
  const sheetService = ss.init();
  sheetOps.init(sheetService);
  const SHEET_TAB = "Sheet1";
  const SINGLE_CELL = `${SHEET_TAB}!C1`;
  const sheetRange = {};
  beforeEach(() => {
    sheetRange.id = "105LhrjQp75T4Q4mZ337ydosno6tjKjDzXNutXf24c1c";
    sheetRange.range = `${SHEET_TAB}!A1`;
  });

  describe("setRangeData() should", () => {
    it("set a single value when passed a [[oneItem]] 2D array", async () => {
      const data = [["Row1TestMe"]];
      const result = await sheetOps.setRangeData(sheetRange, data);
      result.data.updatedCells.should.equal(1);
    });

    it("set multiple rows in a single column", async () => {
      const data = [["Row1Test"], ["Row2Test"]];
      const result = await sheetOps.setRangeData(sheetRange, data);
      result.data.updatedCells.should.equal(2);
    });

    it("set multiple columns and rows ", async () => {
      const data = [["Row1Col1Test", "Row1Col2Test"], ["Row2Col1Test", "Row2Col2Test"]];
      const result = await sheetOps.setRangeData(sheetRange, data);
      const expected = data.length * data[0].length;
      result.data.updatedCells.should.equal(expected);
    });

    it("not overwrite cells that align to empty cells in a sparse array", async () => {
      const data = [[], ["Row2Col1Test", "Row2Col2Test"]];
      const result = await sheetOps.setRangeData(sheetRange, data);
      result.data.updatedCells.should.equal(2);
    });
  });

  describe("setSheetCell() should", () => {
    it("set a single value by just passing in the value", async () => {
      const data = "oneValue";
      sheetRange.range = SINGLE_CELL;
      const result = await sheetOps.setSheetCell(sheetRange, data);
      result.data.updatedCells.should.equal(1);
    });
  });

  describe("getSheetValues() should", () => {
    beforeEach(() => {
      sheetRange.range = `${SHEET_TAB}!A1:C2`;
    });
    const setTestData = async (data) => {
      await sheetOps.setRangeData(sheetRange, data);
    };

    it("return a single value for a range that is one cell", async () => {
      const data = "oneValue";
      sheetRange.range = SINGLE_CELL;
      await sheetOps.setSheetCell(sheetRange, data);
      const result = await sheetOps.getSheetValues(sheetRange);
      result[0][0].should.equal(data);
    });

    it("return multiple values, one for each cell with data in range", async () => {
      const data = [[1, 2, 3], [4, 5, 6]];
      await setTestData(data);
      const result = await sheetOps.getSheetValues(sheetRange);
      const numCells = [].concat(...result).length;
      numCells.should.equal(6);
    });

    it("return a shortened array when a row ends with a blank cell", async () => {
      const data = [[1, 2, ""], [4, 5, 6]];
      await setTestData(data);
      const result = await sheetOps.getSheetValues(sheetRange);
      const numCells = [].concat(...result).length;
      numCells.should.equal(5);
    });

    it("return a full array when a row has a blank cell in the middle", async () => {
      const data = [[1, "", 3], [4, 5, 6]];
      await setTestData(data);
      const result = await sheetOps.getSheetValues(sheetRange);
      const numCells = [].concat(...result).length;
      numCells.should.equal(6);
    });

    it("return a shortened array when the final row has no data ", async () => {
      const data = [[1, "", 3], ["", "", ""]];
      await setTestData(data);
      const result = await sheetOps.getSheetValues(sheetRange);
      should.not.exist(result[1]);
    });
  });
});