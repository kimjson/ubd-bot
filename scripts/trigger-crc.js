const { twitterService } = require('../src/twitter/twitter.service');

const args = process.argv.slice(2);
const webhookId = args[0];

const main = async () => {
  try {
    const response = await twitterService.triggerCRC(webhookId);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

main();