const { twitterService } = require('../src/twitter/twitter.service');

const main = async () => {
  try {
    await twitterService.addSubscription();
    console.log('Success');
  } catch (error) {
    console.log(error);
  }
}

main();
