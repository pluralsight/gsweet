/** Only needed for testing
 */
declare function forceInitialization(): void;

/** One time initialization to load credentials
 */
declare function init(): void;

/** Get the Google Sheet authorization
 */
declare function getGoogleSheetAuth(): void;

/** Get the Google Drive authorization
 */
declare function getGoogleDriveAuth(): void;

/** @protected
 * Called for any auth - goes to Google with the needed credentials
 */
declare function getOAuth2Client(): void;

/**
 * @file Rolls up the Gsuite services into one class
 * [GPL License Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 *
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later
 * @module GSweet
 */
declare module "GSweet" {
    /**
     * @typedef {object} PathOrExisting
     * @property {string} pathOrVarName
     * @property {boolean} useExistingEnvVar
     */
    type PathOrExisting = {
        pathOrVarName: string;
        useExistingEnvVar: boolean;
    };
    /**
     * @param {PathOrExisting} param
     */
    class GSweet {
        constructor(param: PathOrExisting);
    }
}

/** @module
 */
declare module "src/drive/driveOps" {
    /** Enum for the currently supported google mime-types
     */
    var mimeType: any;
    /** Allow access to google drive APIs via the driveService (this version for testing)
     */
    function init(): void;
    /** In production just call this to set up access to the drive APIs
     */
    function autoInit(): void;
    /**
    * @typedef {object} WithNameExactMatch
    * @property {string} withName
    * @property {boolean} exactMatch
     */
    type WithNameExactMatch = {
        withName: string;
        exactMatch: boolean;
    };
    /**
     * Get a list of files/folders that match
     * @param   {WithNameExactMatch} fileOptions
     * @returns {Promise<Array.<{id:String,name:String}>>}
     * @example getFiles({withName:"someName", exactMatch:true})
     */
    function getFiles(fileOptions: WithNameExactMatch): Promise<{ id: String; name: String; }[]>;
    /**
     * @typedef {object} WithNameOnly
     * @property {string} withName
     */
    type WithNameOnly = {
        withName: string;
    };
    /**
     * Get a single file for the passed name. If a single file isn't found an error is thrown.
    // @ts-ignore
     * @param {WithNameOnly} withName
     * @returns {Promise<{id:String,name:String}>}  a single object that has the FILE_META_FOR_NAME_SEARCH properties
     * @example getFile({withName:"someName"})  //forces  exactMatch:true
     */
    function getFile(withName: WithNameOnly): Promise<{ id: String; name: String; }>;
    /**
     * Convenience function that returns the id for a file
     * @param {WithNameExactMatch} withNameObj
     * @returns {Promise<string>} google id for the file
     * @example getFileId({withName:"SomeName"})
     *
     */
    function getFileId(withNameObj: WithNameExactMatch): Promise<string>;
    /**
     * Just get the files for the user. Will only return the google API max
     * of 1000 files.
     * @returns {Promise<Array.<{FILE_META_FOR_FOLDER_SEARCH}>>} array of objects, where each object
     * has the properties specified by the constant `FILE_META_FOR_FOLDER_SEARCH`
     * @example listFiles()
     *
     */
    function listFiles(): Promise<{ FILE_META_FOR_FOLDER_SEARCH: any; }[]>;
    /**
     * @typedef {object} FolderOptions
     * @property {string} withFolderId
     * @property {any}   ofType
     */
    type FolderOptions = {
        withFolderId: string;
        ofType: any;
    };
    /**
     * Get all the Files in the passed folderId   (ofType is optional)
     * @param {FolderOptions} folderOptions
     * @returns {Promise<Array<{name:string, id:string, mimeType:string}>>} array of file objects where each object has the properties
     * specified by the constant `FILE_META_FOR_FOLDER_SEARCH`
     * @example getFilesInFolder({withFolderId:"someId", ofType:mimeType:SPREADSHEET})
     */
    function getFilesInFolder(folderOptions: FolderOptions): Promise<{ name: string; id: string; mimeType: string; }[]>;
    /**
     * Get just the names of the files in the folder (ofType is optional)
     * @param {FolderOptions} folderOptions
     * @returns {Promise<Array.<string>>} array of strings containing filenames
     * @example getFileNamesInFolder({withFolderId:"someId", ofType:mimeType.SPREADSHEET)
     */
    function getFileNamesInFolder(folderOptions: FolderOptions): Promise<string[]>;
    /**
     * Get the files in the parent folder and all the children folders (ofType is optional)
     * @param {FolderOptions} folderOptions
     * @returns {Promise<Array.<{FILE_META_FOR_FOLDER_SEARCH}>>} array of file objects where each object has the properties
     * specified by the constant `FILE_META_FOR_FOLDER_SEARCH`
     * @example getFilesRecursively({withFolderId:"someId", ofType:mimeType.SPREADSHEET})
     */
    function getFilesRecursively(folderOptions: FolderOptions): Promise<{ FILE_META_FOR_FOLDER_SEARCH: any; }[]>;
    /**
     * Private helper function to look up the mimetype string for the passed enum and construct and "and" clause that
     * can be used in the API search query. The FILE enum isn't a type the API understands
     * but we use it to mean any type of file but NOT a folder.
    * @param {number} type
     * @returns {string} the additional clause to limit the search for the specified type.
     * For example if mimeType.SPREADSHEET was passed in, then the clause
     * will be returned.
     * @example getMimeTypeClause(mimeType.SPREADSHEET) will return `and mimeType = application/vnd.google-apps.spreadsheet`
     */
    function getMimeTypeClause(type: number): string;
}

/**
 * @module Drive/driveOps Integration Tests
 */
declare module "Drive/driveOps Integration Tests" { }

/**
 * @module
 */
declare module "src/drive/driveService" {
    /**
     * Set up the service used for the Google Drive API. If no parameter passed in
     * uses the real google API, a fake or mock can be passed in for testing.
     * @param {Object} svc (optional)  if not passed uses the google.drive service
     */
    function init(svc: any): void;
}

/**
 * @file Handles talking to the Google Drive API
 * [GPL License Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 *
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later
 * @module
 */
declare module "src/sheets/sheetFormatOps.js" {
    /**
     * @typedef {Object} FormatCellsBaseType
     * @property {string} sheetId  // This is the tab id number - starting with 0
     * @property {number} row
     * @property {number} col
     */
    type FormatCellsBaseType = {
        sheetId: string;
        row: number;
        col: number;
    };
    /**
     * @typedef {Object} MultipleCellsType
     * @property {number} numRows
     * @property {number} numCols
     */
    type MultipleCellsType = {
        numRows: number;
        numCols: number;
    };
    /**
     * @typedef  {Object} ColorType
     * @property {number} r
     * @property {number} g
     * @property {number} b  // numbers for rgb 0.0->1.0
     */
    type ColorType = {
        r: number;
        g: number;
        b: number;
    };
    /**
     * @typedef   {Object} FormatSingleColorType
     * @property {string} sheetId  // This is the tab id number - starting with 0
     * @property {number} row
     * @property {number} col
     * @property {number} r
     * @property {number} g
     * @property {number} b  // numbers for rgb 0.0->1.0
     */
    type FormatSingleColorType = {
        sheetId: string;
        row: number;
        col: number;
        r: number;
        g: number;
        b: number;
    };
    /**
     * @typedef   {Object} FormatCellsColorType
     * * @property {string} sheetId  // This is the tab id number - starting with 0
     * @property {number} row
     * @property {number} col
     * @property {ColorType} color
     * @property {number} numRows
     * @property {number} numCols
     */
    type FormatCellsColorType = {
        row: number;
        col: number;
        color: ColorType;
        numRows: number;
        numCols: number;
    };
    /**
     * @typedef   NoteType
     * @property {string} note
     */
    type NoteType = {
        note: string;
    };
    /**
     * @typedef {Object} FormatCellsNoteType
     * @property {string} sheetId  // This is the tab id number - starting with 0
     * @property {number} row
     * @property {number} col
     * @property {string} note
     */
    type FormatCellsNoteType = {
        sheetId: string;
        row: number;
        col: number;
        note: string;
    };
    /** just get the default service and use it
     */
    function autoInit(): void;
    /**
     *
     * @param {FormatCellsColorType} param
     */
    function getBgColorRequest(param: FormatCellsColorType): void;
    /**
     * Example of how to set FG,BG, Bold, fontsize etc
     * The fields property restricts things from getting changes so if
     * I just wanted the text foreground to change I could replace
     * textFormat with textFormat/foregroundColor. As is any textFormat not specified
     * will get reset to the google sheet default value for that formatting property
     * @param {FormatCellsColorType} param
     */
    function getFormatCellsRequest(param: FormatCellsColorType): void;
    /**
     *
     * @noteOptions {FormatCellsNoteType} noteOptions
     */
    function getAddNoteRequest(): void;
    /**
     * @param {{id:string, formatOptions:FormatCellsColorType}} param0
     */
    function formatCellsBgColor(param0: any): void;
    /**
     * @param {object} obj
     * @param {string} obj.id
     * @param {FormatSingleColorType} obj.singleCellOptions
     */
    function formatSingleBgColor(obj: {
        id: string;
        singleCellOptions: FormatSingleColorType;
    }): void;
    /**
     * Example of how to set FG,BG, Bold, fontsize etc
     * The fields property restricts things from getting changes so if
     * I just wanted the text foreground to change I could replace
     * textFormat with textFormat/foregroundColor
     * @param  {object} obj
     * @param {string} obj.id  spreadsheet id
     * @param {FormatCellsColorType} obj.formatOptions
     */
    function formatCells(obj: {
        id: string;
        formatOptions: FormatCellsColorType;
    }): void;
    /**
     * @param {object} obj
     * @param {string} obj.id  id of the google spreadsheet
     * @param {FormatCellsNoteType} obj.noteOptions  google API request with `notes` field
     */
    function addNoteToCell(obj: {
        id: string;
        noteOptions: FormatCellsNoteType;
    }): void;
    /**
     * Turn the passed object into an array and then put that array in the
     * object that the batchUpdate Google API wants
     * @param {object} obj
     * @param {string} obj.id the id of the spreadsheet
     * @param {object} obj.requestObj a single object that represents a google API request
     */
    function makeSingleObjBatchRequest(obj: {
        id: string;
        requestObj: any;
    }): void;
    /**
     * Take the passed array of requests and format them and send them off to the spreadsheet
     * @param {object} obj
     * @param {string} obj.id the spreadsheet ID
     * @param {[object]} obj.requestArray
     */
    function makeBatchRequest(obj: {
        id: string;
    }): void;
    /**
     * Put the array of requests into an object that has a `requests` property
     * @param {Array<object>} requests
     */
    function prepareBatchRequest(requests: object[]): void;
    /**
     * Call the Google API that processes batchUpdate requests. This is how sheet
     * formatting and adding of notes is done.
     * @param {object} obj
     * @param {string} obj.id
     * @param {object} obj.requests
     * @returns {Promise<object>}
     */
    function batchUpdate(obj: {
        id: string;
        requests: any;
    }): Promise<object>;
}

/**
 * @file Handles talking to the Google Drive API
 * [GPL License Full Text](https://spdx.org/licenses/GPL-3.0-or-later.html)
 *
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 * @license GPL-3.0-or-later
 * @module sheetOps
 */
declare module "sheetOps" {
    /**
     * Set up this module with the object that allows access to the google sheet
     * calls. Typically from the value returned by sheetService.init(). When testing
     * a mocked object can be passed in. Only needs to be done once.
     * @param {Object} sheetService optional
     */
    function init(sheetService: any): void;
    /** just get the default service and use it
     */
    function autoInit(): void;
    /**
     * @typedef IdRangeType
     * @property {string} id
     * @property {string} range
     */
    type IdRangeType = {
        id: string;
        range: string;
    };
    /**
     * @typedef IdRangeDataType
     * @property {string} id
     * @property {string} range
     * @property {[][]} data
     */
    type IdRangeDataType = {
        id: string;
        range: string;
    };
    /**
     * @typedef IdRangeValueType
     * @property {string} id
     * @property {string} range
     * @property {any} value
     */
    type IdRangeValueType = {
        id: string;
        range: string;
        value: any;
    };
    /**
     * Set a range of data in a target sheet with an array of arrays of data
     * By default each inner array is a row in the sheet with an element for each column
     * if a sparse array is sent the missing cells in the range are skipped
     * (i.e. they aren't overwritten)
     * @param {IdRangeDataType} sheetRangeData
     * @returns {Promise<{config:{data:{values:[][]}},
     * data:{spreadsheetId:string,updatedRange:string,updatedRows:number,updatedColumns:number, updatedCells:number}}>}
     * object with many props including config.data and data
     * ```
     * {
     *   config: {
     * ...
     *     data: {
     *       values: [[2D array of data sent]]
     *           }
     * ...
     *     },
     *   data: {
     *     spreadsheetId,
     *     updatedRange,
     *     updatedRows,
     *     updatedColumns,
     *     updatedCells ,
     *   }
     * headers:{...}
     * status:number
     * statusText:string
     * }
     *```
     * these properties can be useful for testing
     * @example setRangeData({id:"longgoogleid",range:"Sheet1!A1", data:[["R1C1","R1C2"],["R2C1","R2C2"]]})
     */
    function setRangeData(sheetRangeData: IdRangeDataType): any;
    /**
     * Convenience function that will take a string or number primitive and wrap
     * it into a 2D array to write to the spreadsheet.
     * @param {IdRangeValueType} sheetRangeValue - where the range property should specify a single cell
     * @returns {Promise<Object>} see setRangeData for details on returned Object
     * @example setSheetCell({id:SHEET_ID, range:Tab!A1, value:"SomeValue"})
     */
    function setSheetCell(sheetRangeValue: IdRangeValueType): Promise<object>;
    /**
     * Get all the cells in the specified range. If a given row has no data in the
     * final cells for a row, the array for that row is shortened. If a row has no
     * data no array for that row is returned.
     * @param {IdRangeType} sheetRange  range property should include name of tab `Tab1!A2:C6`
     * @returns {Promise<Array.<Array<number|string>>>} an array of rows containing an array for each column of data (even if only one column).
     * @example getSheetValues({id:SOME_ID, range:TabName!A:I})
     */
    function getSheetValues(sheetRange: IdRangeType): Promise<(number | string)[][]>;
    /**
     *
     * @param {string} sheetId
     */
    function getSheetProperties(sheetId: string): void;
    /**
     * @typedef {object} SheetIndexName
     *  @property  {string} sheetId
     *  @property  {number?} sheetIndex
     *  @property  {string?} sheetName
     */
    type SheetIndexName = {
        sheetId: string;
        sheetIndex: number;
        sheetName: string;
    };
    /**
     * @typedef {object} gridProperties
     * @property {boolean} isValid
     * @property {number} rowCount
     * @property {number} columnCount
     * @property {string} message
     */
    type gridProperties = {
        isValid: boolean;
        rowCount: number;
        columnCount: number;
        message: string;
    };
    /**
     * Get the grid properties which is an object with a rowCount and columnCount
     * property.
     * @param {SheetIndexName} sheetInfo
     * @returns {Promise<gridProperties>}
     */
    function getSheetGridProperties(sheetInfo: SheetIndexName): Promise<gridProperties>;
    /**
     * @typedef {object} SheetNameSheets
     *  @property  {string} sheetName
     *  @property {object} sheets
    }}
     */
    type SheetNameSheets = {
        sheetName: string;
        sheets: any;
    };
    /**
     * @typedef {object} IsValidSheet
     *  @property {boolean} isValid
     *  @property {any} sheet
     */
    type IsValidSheet = {
        isValid: boolean;
        sheet: any;
    };
    /**
     * @param {SheetNameSheets} param0
     * @returns {IsValidSheet}
     */
    function getSheetByName(param0: SheetNameSheets): IsValidSheet;
    /**
     * From the id passed for the SPREADSHEET, find the id of the Sheet (aka tab) with the passed name.
     * Note that this returns the ID not the index, although often the id of the first sheet is often 0
     * the other sheets have longer ids
     * @param {SheetIndexName} sheetInfo
     * @returns {Promise<{isValid:boolean, sheetId:number}>}
     */
    function getSheetIdByName(sheetInfo: SheetIndexName): Promise<{ isValid: boolean; sheetId: number; }>;
}

/**
 * @module Sheet/sheetOps Integration Tests
 * @author Tod Gentille <tod-gentille@pluralsight.com>
 */
declare module "Sheet/sheetOps Integration Tests" { }

/**
 * @file Creat the Google drive service needed to hit the Drive API
 * @author Tod Gentille
 * @requires NPM:googleapis
 * @requires ../googleAuthHelper
 * @module
 */
declare module "src/sheets/sheetService.js" {
    /** holds the sheetService created by init()
     *  @type {Object}
     */
    var _sheetService: any;
    /**
     *  This needs to be called just once.
     *  The results of this function are stored in `_sheetService`.
     *  If no service is passed to init it grabs the default Google Sheet Service.
     *  Passing the service in makes it easy to do unit testing since a Fake can
     *  be passed in.
     * @returns {Object} - the service. Typically not needed by caller.
     */
    function init(): any;
    /**
     * Get the default Google Sheet API service.
     * @returns {Object} the actual Google Sheet Service
     */
    function getSheetServiceDefault(): any;
}

