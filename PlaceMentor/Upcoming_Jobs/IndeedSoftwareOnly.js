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
    var softwareJobsLinksOnly = "https://in.indeed.com/jobs?q=Software+Developer&l=India&fromage=7"; // Software India Jobs Last 7 Days Page
    await tab.goto("https://in.indeed.com/jobs?q=Software+Developer&l=India&fromage=7");
    await tab.waitForSelector(".npl.advanced-search"); // Advanced Job Search Button (Top-Right) Selector
    let indeedSoftwareJobsListData = await tab.evaluate(indeedSoftwareOnlyFunc,".jobsearch-SerpJobCard.unifiedRow.row.result.clickcard"); // All Jobs Results Page Data
    console.table(indeedSoftwareJobsListData);

    let filePath = __dirname + "\\IndeedSoftwareOnly.xlsx";
    let fileName = "IndeedSoftwareOnly";
    let content = excelReader(filePath, fileName);
    for (let i = 0 ; i < indeedSoftwareJobsListData.length ; i++) {
      content.push(indeedSoftwareJobsListData[i]);
    }
    excelWriter(filePath, content, fileName);
    var num = 0;
    for (let i = 1 ; i < 5 ; i++) {
      num = num + 10;
      softwareJobsLinksOnly = updateSoftwareJobsLink(softwareJobsLinksOnly, num);
      await tab.goto(softwareJobsLinksOnly);
      await tab.waitForSelector(".npl.advanced-search");
      let indeedSoftwareJobsListData = await tab.evaluate(indeedSoftwareOnlyFunc,".jobsearch-SerpJobCard.unifiedRow.row.result.clickcard"); // All Jobs Results Page Data
      console.table(indeedSoftwareJobsListData);

      let fileContent = excelReader(filePath, fileName);
      for (let i = 0 ; i < indeedSoftwareJobsListData.length ; i++) {
        fileContent.push(indeedSoftwareJobsListData[i]);
      }
      excelWriter(filePath, fileContent, fileName);
    }
  }
  catch (err) {
    console.log(err);
  }
})();

function indeedSoftwareOnlyFunc(selector) {
  let allElements = document.querySelectorAll(selector);
  let indeedSoftwareJobsListData = [];
  for (let i = 0 ; i < allElements.length ; i++) {
    let jobType = document.querySelectorAll(".title a")[i].getAttribute("title");
    let jobLink = document.querySelectorAll(".title a")[i].getAttribute("href");
    let companyName = document.querySelectorAll(".company")[i].innerText;
    let skillsRequired = document.querySelectorAll(".summary").innerText;
    let salaryElement = document.querySelectorAll(".salarySnippet.salarySnippetDemphasizeholisticSalary span span")[i];
    let salary;
    let fullJobLink = "https://in.indeed.com" + jobLink;
    if (salaryElement != undefined) {
      salary = salaryElement.innerText;
    }
    else {
      salary = "Not Mentioned";
    }
    let object = {
      "JobName/Type": jobType,
      "JobLink": fullJobLink,
      "CompanyName": companyName,
      "SkillsRequired": skillsRequired,
      "Salary": salary,
    };
    indeedSoftwareJobsListData.push(object);
  }
  return indeedSoftwareJobsListData;
}

function updateSoftwareJobsLink(softwareJobsLinksOnly, num) {
    let splittedLink = softwareJobsLinksOnly.split("&");
    let lastElement = splittedLink[splittedLink.length - 1];
    if (lastElement[0] != "s") {
      softwareJobsLinksOnly = softwareJobsLinksOnly + "&start=" + num;
      return softwareJobsLinksOnly;
    } else {
      let updatedSoftwareJobsLink = "";
      for (let i = 0 ; i < splittedLink.length - 1 ; i++) {
        updatedSoftwareJobsLink = updatedSoftwareJobsLink + splittedLink[i] + "&";
      }
      updatedSoftwareJobsLink = updatedSoftwareJobsLink + "start=" + num;
      return updatedSoftwareJobsLink;
    }
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
