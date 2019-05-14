const { twitterService } = require('../src/twitter/twitter.service');

const main = async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) throw 'One argument(URL) is required';
    const url = args[0];

    const response = await twitterService.registerWebhook(url);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

main();
