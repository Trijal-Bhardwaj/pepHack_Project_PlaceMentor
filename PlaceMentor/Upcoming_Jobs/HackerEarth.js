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
    await tab.goto("https://www.hackerearth.com/companies/", {visible:true});
    // 3 Selectors = All_Companies Selector, Company_Openings Selector, Each_Company_Name Selector are Passed into Function hackerEarthFunc which Returns an Array hackerEarthList Data containing All Data of All Available Jobs in Tabular Form
    let hackerEarthData = await tab.evaluate(hackerEarthFunc,".company-card-container",".light.openings",".company-card-container .name.ellipsis");
    console.table(hackerEarthData);
    let filePath = __dirname + "\\HackerEarthJobs.xlsx";
    let fileName = "HackerEarthJobs";
    let fileContent = excelReader(filePath, fileName);
    for (let i = 0 ; i < hackerEarthData.length ; i++) {
      fileContent.push(hackerEarthData[i]);
    }
    excelWriter(filePath, fileContent, fileName);
  }
  catch (err) {
    console.log(err);
  }
})();

function hackerEarthFunc(allCompaniesSelector, jobOpeningsSelector, companyNameSelector) {
  let hackerEarthData = [];
  let allElements = document.querySelectorAll(allCompaniesSelector);
  for (let i = 0 ; i < allElements.length ; i++) {
    let isJobOpeningAvailable = allElements[i].querySelector(jobOpeningsSelector);
    if (isJobOpeningAvailable != null) {
      let companyName = allElements[i].querySelector(companyNameSelector).innerText;
      let companyNameCardLinkSelector = allElements[i].getAttribute("link");
      let allAvailableJobOpeningsOfOneCompany = "https://www.hackerearth.com" + companyNameCardLinkSelector + "jobs";
   // console.log(companyNameCardLinkSelector);
      console.log(allAvailableJobOpeningsOfOneCompany);
      console.log(allElements);
      let object = {
        "CompanyName": companyName,
        "AllAvailableJobOpeningsLinkOfThisCompany": allAvailableJobOpeningsOfOneCompany,
      };
      hackerEarthData.push(object);
    }
  }
  return hackerEarthData;
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
