const { getWebhooks } = require('./shared');

const main = async () => {
  try {
    const response = await getWebhooks();
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

main();
