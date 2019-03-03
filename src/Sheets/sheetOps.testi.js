/**
 * @module Sheet/sheetOps Integration Tests
 */
const chai = require("chai");
const should = chai.should();
const ss = require("./sheetService");
const sheetOps = require("./sheetOps");
const logger = require("../utils/logger");

describe("module sheetOps", function () {
  this.timeout(10000);
  const sheetService = ss.init();
  sheetOps.init(sheetService);
  const SHEET_ID = "105LhrjQp75T4Q4mZ337ydosno6tjKjDzXNutXf24c1c";
  const SHEET_TAB = "Sheet1";
  const SHEET_RANGE = `${SHEET_TAB}!A1`;
  const SINGLE_CELL = `${SHEET_TAB}!C1`;
  const READ_RANGE = `${SHEET_TAB}!A1:C2`;


  describe("setRangeData() should", () => {
    it("set a single value when passed a [[oneitem]] 2D array", async () => {
      const data = [["Row1TestMe"]];
      const result = await sheetOps.setRangeData(SHEET_ID, SHEET_RANGE, data);
      result.data.updatedCells.should.equal(1);
    });

    it("set multiple rows in a single column", async () => {
      const data = [["Row1Test"], ["Row2Test"]];
      const result = await sheetOps.setRangeData(SHEET_ID, SHEET_RANGE, data);
      result.data.updatedCells.should.equal(2);
    });

    it("set multiple columns and rows ", async () => {
      const data = [["Row1Col1Test", "Row1Col2Test"], ["Row2Col1Test", "Row2Col2Test"]];
      const result = await sheetOps.setRangeData(SHEET_ID, SHEET_RANGE, data);
      const expected = data.length * data[0].length;
      result.data.updatedCells.should.equal(expected);
    });

    it("not overwrite cells that align to empty cells in a sparse array", async () => {
      const data = [[], ["Row2Col1Test", "Row2Col2Test"]];
      const result = await sheetOps.setRangeData(SHEET_ID, SHEET_RANGE, data);
      result.data.updatedCells.should.equal(2);
    });
  });

  describe("setSheetCell() should", () => {
    it.only("set a single value by just passing in the value", async () => {
      const data = "oneValue";
      const result = await sheetOps.setSheetCell(SHEET_ID, SINGLE_CELL, data);
      result.data.updatedCells.should.equal(1);
    });
  });

  describe("getSheetValues() should", () => {
    it("return a single value for a range that is one cell", async () => {
      const data = "oneValue";
      await sheetOps.setSheetCell(SHEET_ID, SINGLE_CELL, data);
      const result = await sheetOps.getSheetValues(SHEET_ID, SINGLE_CELL);
      result[0][0].should.equal(data);
    });

    it("return multiple values, one for each cell with data in range", async () => {
      const data = [[1, 2, 3], [4, 5, 6]];
      await sheetOps.setRangeData(SHEET_ID, READ_RANGE, data);
      const result = await sheetOps.getSheetValues(SHEET_ID, READ_RANGE);
      const numCells = result[0].length + result[1].length;
      numCells.should.equal(6);
    });

    it("return a shortened array when a row ends with a blank cell", async () => {
      const data = [[1, 2, ""], [4, 5, 6]];
      await sheetOps.setRangeData(SHEET_ID, READ_RANGE, data);
      const result = await sheetOps.getSheetValues(SHEET_ID, READ_RANGE);
      const numCells = result[0].length + result[1].length;
      numCells.should.equal(5);
    });

    it("return a full array when a row has a blank cell in the middle", async () => {
      const data = [[1, "", 3], [4, 5, 6]];
      await sheetOps.setRangeData(SHEET_ID, READ_RANGE, data);
      const result = await sheetOps.getSheetValues(SHEET_ID, READ_RANGE);
      const numCells = result[0].length + result[1].length;
      numCells.should.equal(6);
    });

    it("return a shortened array when the final row has no data ", async () => {
      const data = [[1, "", 3], ["", "", ""]];
      await sheetOps.setRangeData(SHEET_ID, READ_RANGE, data);
      const result = await sheetOps.getSheetValues(SHEET_ID, READ_RANGE);
      should.not.exist(result[1]);
    });
  });
});