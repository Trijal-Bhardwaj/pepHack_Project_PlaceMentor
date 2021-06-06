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
    await tab.goto("https://devfolio.co/hackathons");
    let allDevFolioHackathonsData = await tab.evaluate(devfolioFunc);
    console.table(allDevFolioHackathonsData);
    let filePath = __dirname + "\\DevFolioHackathons.xlsx";
    let fileName = "DevfolioHackathons";
    let fileContent = excelReader(filePath, fileName);
    for (let i = 0 ; i < allDevFolioHackathonsData.length ; i++) {
      fileContent.push(allDevFolioHackathonsData[i]);
    }
    excelWriter(filePath, fileContent, fileName);
  }
  catch (err) {
    console.log(err);
  }
})();

function devfolioFunc() {
  let allElements = [];
  let allDevFolioHackathonsData = document.querySelectorAll(".style__Inner-sc-19afmba-7.jcKWGN"); // Hackathon Div
  console.log(allDevFolioHackathonsData.length);
  let j = 0;
  for (let i = 0 ; i < allDevFolioHackathonsData.length; i++) {
    let hackathonLink = document.querySelectorAll(".style__Flex-sc-19afmba-5.gwHgou a")[i].getAttribute("href");
    let hackathonName = document.querySelectorAll(".sc-fzqNJr.kwhLPe")[i].innerText;
    let hackathonStartDate = document.querySelectorAll(".sc-fzqNJr.esEXVk")[j].innerText;
    let hackathonEndDate = document.querySelectorAll(".sc-fzqNJr.esEXVk")[j + 1].innerText;
    j = j + 2;
    let object = {
      "HackathonName" : hackathonName,
      "HackathonLink" : hackathonLink,
      "HackathonStartDate": hackathonStartDate,
      "HackathonEndDate": hackathonEndDate,
    };
    allElements.push(object);
  }
  console.table(allElements);
  return allElements;
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