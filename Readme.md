# Read me

## Minimum Viable Approach Idea

Search through all spreadsheets in
`Curriculum Master Folder → Role IQ→Curriculum Artifacts→Learning Blueprints`  folder and all subfolders _Note it would help to clean out some of the test folders, and other things that can lead to false positives_
(For now) If the name starts with “Copy of” skip the sheet.
Look for `spreadsheets` with user specified keywords in the name of the sheet. (e.g. Machine Learning).
The simplest thing at this point  would be to count the number of rows of learning objectives and divide by N. (N would be something configurable like 2 or 3).  
A more sophisticated approach would be to look for the existence of the `learning_resource_name` column and if it exists AND if it has values for all rows then count the number of unique values. (MVP2 once we have clean data?)  

### Keywords

Use a spreadsheet to specify the search terms. At first I would suggest just a single column of values so if the user typed
GCP
AWS
Azure

The report would kick out three results. Given the dirty nature  of the data (see blelow) the three results would be a summary and the report would also contain details on the files/rows processed to serve as a sanity check. A further iteration could allow  multiple columns, where each additional column could specify an “alias” to use so you could type something like the following in a single row (one item per cell)
Machine Learning, ML,  Intelligent Retrieval, knowledge engineering

and get a count with any sheet using any of those terms. 

## Dirty data challenges

1. the folder itself is “dirty” - folders and files that aren’t learning blueprints exist there.
2. The learning blueprints themselves aren’t in a standard format. Many that I just looked at for instance did not have a  `learning_resource_name` column. Some that had that column, had no values in that column.  
3. LBs that are in standard format often don’t have learning resources called out

## Additional Known Limitations

There is no way to know if the courses for a learning blueprint are in progress or complete. Likely not too big a problem right now. Once the learning resource name exists in all blueprints, if that name were accurate we could query either SF (if in process is important) or the most recent nightly snapshot and eliminate courses that are published. Seems unlikely that the names would match.  