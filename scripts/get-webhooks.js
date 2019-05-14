const { twitterService } = require('../src/twitter/twitter.service');

const main = async () => {
  try {
    const response = await twitterService.getWebhooks();
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

main();
