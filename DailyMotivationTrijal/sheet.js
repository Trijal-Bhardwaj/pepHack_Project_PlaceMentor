const { GoogleSpreadsheet } = require("google-spreadsheet");

module.exports = class Sheet {
  constructor() {
    this.doc = new GoogleSpreadsheet("1JChcTVSknRfO4z4awA1irBMFwPzoxZYvyCwfTwTMijQ");
  }
  async load() {
    await this.doc.useServiceAccountAuth(require("./credentials.json"));
    await this.doc.loadInfo();
  }
  async addRows(rows) {
    const sheet = this.doc.sheetsByIndex[0];
    await sheet.addRows(rows);
  }
  async getRows() {
    const sheet = this.doc.sheetsByIndex[0];
    return await sheet.getRows();
  }
}
  
  

// (async function() {
//     const sheet = Sheet();
//     await sheet.load();
//     await sheet.addRows([
//         { name: 'Sergey Brin', email: 'sergey@google.com' },
//         { name: 'Eric Schmidt', email: 'eric@google.com' },
//     ]);
// })()
