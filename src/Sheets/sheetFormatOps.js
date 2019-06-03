
/**
 * @typedef FormatCellsBaseType
 * @property sheetId:string  // This is the tab id number - starting with 0
 * @property row:number
 * @property col:number
 */

/**
 * @typedef MultipleCellsType
 * @property numRows:number
 * @property numCols: number
  */
/**
 * @typedef   ColorType
 * @property color:{r:number, g:number, b:number}  // numbers for rgb 0.0->1.0
 */

/**
 * @typedef   {FormatCellsBaseType & MultipleCellsType & ColorType} FormatCellsColorType
 */

/**
 * @typedef   NoteType
 * @property note:string
 */
/**
 * @typedef   {FormatCellsBaseType & NoteType} FormatCellsNoteType
 */


/**
 * 
 * @param {FormatCellsColorType} param 
 */
const getFormatCellBgColorRequest =  (param) => {
  const {sheetId, row, col, numRows, numCols, color} = param
  const request = {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: row,
            endRowIndex: row + numRows,
            startColumnIndex: col,
            endColumnIndex: col + numCols,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: color.r,
                green: color.g,
                blue: color.b,
              },
            },
          },
          fields: 'userEnteredFormat(backgroundColor)', 
        },
      }
    ],
  }
  return request
}

/**
 * Example of how to set FG,BG, Bold, fontsize etc
 * The fields property restricts things from getting changes so if
 * I just wanted the text foreground to change I could replace
 * textFormat with textFormat/foregroundColor
 * @param {FormatCellsColorType} param 
 */
const getFormatCellsRequest =  (param) => {
  const {sheetId, row, col, numRows, numCols, color} = param
  const request = {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: row,
            endRowIndex: row + numRows,
            startColumnIndex: col,
            endColumnIndex: col + numCols,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 1.0,
                green: 1.0,
                blue: 1.0,
              },
              horizontalAlignment : 'CENTER',
              textFormat: {
                foregroundColor: {
                  red: color.r,
                  green: color.g,
                  blue: color.b,
                },
                fontSize: 12,
                bold: true,
              },
            },
          },
          fields: 'userEnteredFormat(backgroundColor ,textFormat ,horizontalAlignment)',
        },
      }
    ],
  }
  return request
}

/**
 * 
 * @param {FormatCellsNoteType} param 
 */
const getAddNoteToCellRequest =  (param) => {
  const {sheetId, row, col, note} = param
  const request = {
    requests: [
      {
        updateCells: {
          range: {
            sheetId,
            startRowIndex: row,
            endRowIndex: row + 1,
            startColumnIndex: col,
            endColumnIndex: col + 1,
          },
          rows: {
            values: [{
              note,
            }
            ],
          },
          fields: 'note', 
        },
      }
    ],
  }
  return request
}


module.exports = {
  getFormatCellBgColorRequest,
  getFormatCellsRequest,
  getAddNoteToCellRequest,
}