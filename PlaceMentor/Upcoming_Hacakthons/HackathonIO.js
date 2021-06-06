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
    await tab.goto("https://www.hackathon.io/events");
    let allHackathonIOEventsData = await tab.evaluate(hackathonIOFunc, ".event-teaser");
    console.table(allHackathonIOEventsData);
    let filePath = __dirname + "\\HackathonIOHackathons.xlsx";
    let fileName = "HackathonIOHackathons";
    let fileContent = excelReader(filePath, fileName);
    for (let i = 0 ; i < allHackathonIOEventsData.length ; i++) {
      fileContent.push(allHackathonIOEventsData[i]);
    }
    excelWriter(filePath, fileContent, fileName);
  }
  catch (err) {
    console.log(err);
  }
})();

function hackathonIOFunc(selector) {
  let allHackathons = [];
  let allElements = document.querySelectorAll(selector);
  for (let i = 0 ; i < allElements.length ; i++) {
    let hackathonTime = document.querySelectorAll(".two.columns.time")[i].innerText;
    let hackathonName = document.querySelectorAll(".seven.columns.description h4 a")[i].innerText;
    let hackathonLink = document.querySelectorAll(".seven.columns.description h4 a")[i].getAttribute("href");
    let hackathonDescription = document.querySelectorAll(".seven.columns.description h5 a")[i].innerText;
    let elementLocation = document.querySelectorAll(".two.columns.location a")[i];
    let hackathonFullLink = "https://www.hackathon.io" + hackathonLink;
    let hackathonLocation;
    if (elementLocation != undefined) {
        hackathonLocation = elementLocation.innerText;
    }
    else {
        hackathonLocation = "Location Not Mentioned";
    }
    let object = {
      "HackathonTime": hackathonTime,
      "HackathonName": hackathonName,
      "HackathonLink": hackathonFullLink,
      "HackathonDescription": hackathonDescription,
      "HackathonLocation": hackathonLocation,
    };
    allHackathons.push(object);
  }
  return allHackathons;
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