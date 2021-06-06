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
    await tab.goto("https://remoteok.io/remote-dev-jobs");
    let remoteOkSDEOnlyJobsData = await tab.evaluate(remoteOkSDEOnlyFunc,".job");
    console.table(remoteOkSDEOnlyJobsData);

    let filePath = __dirname + "\\remoteOkSDEOnly.xlsx";
    let fileName = "remoteOkSDEOnly";
    let fileContent = excelReader(filePath, fileName);
    for (let i = 0 ; i < remoteOkSDEOnlyJobsData.length ; i++) {
      fileContent.push(remoteOkSDEOnlyJobsData[i]);
    }
    excelWriter(filePath, fileContent, fileName);
  }
  catch (err) {
    console.log(err);
  }
})();

function remoteOkSDEOnlyFunc(selector) {
  let allElements = document.querySelectorAll(selector);
  let remoteOkSDEOnlyJobsListData = [];
  let j = 0;
  for (let i = 0 ; i < allElements.length ; i++) {
    let jobLink = document.querySelectorAll(".job")[i].getAttribute("data-url");
    let companyName = document.querySelectorAll(".job .companyLink h3")[i].innerText;
    let jobType = document.querySelectorAll(".job .preventLink h2")[j].innerText;
    let fullJobLink = "https://remoteok.io/" + jobLink;
    j = j + 1;

    let object = {
      "CompanyName": companyName,
      "JobLink": fullJobLink,
      "JobName/Type": jobType,
    };
    remoteOkSDEOnlyJobsListData.push(object);
  }
  return remoteOkSDEOnlyJobsListData;
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
