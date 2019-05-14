const { twitterService } = require('../src/twitter/twitter.service');

const main = async () => {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) throw 'One argument(Webhook ID) is required';
    const webhookId = args[0];

    await twitterService.triggerCRC(webhookId);
    console.log('Success');
  } catch (error) {
    console.log(error);
  }
}

main();