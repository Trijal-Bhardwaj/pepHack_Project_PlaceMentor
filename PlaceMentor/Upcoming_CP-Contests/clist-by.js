const puppeteer = require("puppeteer");
const fs = require("fs");
const xlsx = require("xlsx"); // A Parser and Writer NPM Library For Various Excel/Spreadsheet Formats & Functions
let tab;

(async function main() {
  try {
    let browserOpenPromise = puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
      ignoreDefaultArgs: ["--disable-extensions"],
    });
    let browser = await browserOpenPromise;
    let pages = await browser.pages();
    tab = pages[0];
    await tab.goto("https://clist.by/");
    await tab.waitForSelector(".small.text-muted", {visible: true}); // Waiting For Day & Time Selector On Top-Left To Load/Adjust According To User's Time-Zone
    // 4 Selectors = each_complete-Row, each_startEndTime-duration-timeLeft_Row, each_eventName-Row, each_eventWebsiteName-Row are Passed into Function cListFunc which Returns an Array allCListData containing All clist-by Website Data in Tabular Form
  // Ongoing Contests 
    let allCListData = await tab.evaluate(cListFunc, ".row.contest.running.bg-success",".row.contest.running.bg-success .col-md-5.col-sm-4",".row.contest.running.bg-success .contest_title",".subcontest");
    console.table(allCListData);
  // Pushing cList Data Of Ongoing Contests To clist-by.xlsx
    let filePath = __dirname + "\\clist-by.xlsx";
    let fileName = "clist-by";
    let fileContent1 = excelReader(filePath, fileName);
    for (let i = 0 ; i < allCListData.length ; i++) {
      fileContent1.push(allCListData[i]);
    }
    excelWriter(filePath, fileContent1, fileName);
  // Upcoming Contests 
    allCListData = await tab.evaluate(cListFunc, ".row.contest.coming",".row.contest.coming .col-md-5.col-sm-4",".row.contest.coming .contest_title",".subcontest");
    console.table(allCListData);
  // Pushing cList Data Of Upcoming Contests To clist-by.xlsx
    let fileContent2 = excelReader(filePath, fileName);
    for (let i = 0 ; i < allCListData.length ; i++) {
      fileContent2.push(allCListData[i]);
    }
    excelWriter(filePath, fileContent2, fileName);
  }
  catch (err) {
    console.log(err);
  }
})();

function cListFunc(completeRow_Selector, startEndTime_duration_timeLeft_Selector, eventName_Selector, eventWebsiteName_Selector) {
  let allElements = document.querySelectorAll(completeRow_Selector);
  console.log(allElements);
  console.log(allElements.length);
  let allCListData = [];
  for (let i = 0 ; i < allElements.length ; i++) {
    let eventWebsiteName = allElements[i].querySelector(eventWebsiteName_Selector);
    if (eventWebsiteName == null) {
      let eventNameData = document.querySelectorAll(eventName_Selector)[i].innerText;
      let startEndTime_duration_timeLeft_Data = document.querySelectorAll(startEndTime_duration_timeLeft_Selector)[i].innerText.split("\n");
      let startEndTimeData = startEndTime_duration_timeLeft_Data[0];
      let durationData = startEndTime_duration_timeLeft_Data[1];
      let timeLeftData = startEndTime_duration_timeLeft_Data[2];
      let object = {
        "Event": eventNameData,
        "StartEndTime": startEndTimeData,
        "Duration": durationData,
        "TimeLeft": timeLeftData,
      };
      if (startEndTimeData != ""){
        allCListData.push(object);
      }
    }
  }
  return allCListData;
}
    
function excelReader(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    return [];
  } 
  else {
    // Workbook => Excel
    let workBook = xlsx.readFile(filePath);
    // Getting Data From WorkBook
    let excelData = workBook.Sheets[fileName];
    // Converting Excel Format To JSON => Array Of Objects
    let JSON = xlsx.utils.sheet_to_json(excelData);
    // console.log(JSON);
    return JSON;
  }
}

function excelWriter(filePath, fileContent, fileName) {
  // console.log(xlsx.readFile(filePath));
  let newWorkBook = xlsx.utils.book_new();
  //  console.log(fileContent);
  let newWorkSheet = xlsx.utils.json_to_sheet(fileContent);
  // WorkBook Name As param
  xlsx.utils.book_append_sheet(newWorkBook, newWorkSheet, fileName);
  // File => Create , Replace
  // Replace
  xlsx.writeFile(newWorkBook, filePath);
}