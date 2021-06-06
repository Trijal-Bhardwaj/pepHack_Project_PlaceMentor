const Twitter = require("twitter");
const Sheet = require("./sheet");

(async function () {
  // Connect To Twitter Via API
  const client = new Twitter({
    consumer_key: 'TWITTER_CONSUMER_KEY',
    consumer_secret: 'TWITTER_CONSUMER_SECRET',
    access_token_key: 'TWITTER_ACCESS_TOKEN_KEY',
    access_token_secret: 'TWITTER_ACCESS_TOKEN_SECRET'
  });
  // Pull Next Tweet From SpreadSheet
  const sheet = new Sheet();
  await sheet.load();
  const content = await sheet.getRows();
  const status = content[0].JobType + " - " + content[0].JobLink + " - " + content[0].CompanyName + " - " + content[0].Salary;
//console.log(content[0].JobType + " - " + content[0].JobLink + " - " + content[0].CompanyName + " - " + content[0].Salary);
  // Send Tweet
  client.post("statuses/update",{ status }, function (error, tweet, response) {
      if (error) throw error;
      //console.log(tweet); // Tweet Body.
  });
  // Remove Quote From SpreadSheet
  await content[0].delete();
  console.log('Off-Campus Jobs - ', content[0].JobType + " - " + content[0].JobLink + " - " + content[0].CompanyName + " - " + content[0].Salary);
})();

// const Sheet = require('./MoTweeVation/sheet');
// const fetch = require('node-fetch');

// (async function() {
//     const sheet = new Sheet();
//     await sheet.load();
// })();
