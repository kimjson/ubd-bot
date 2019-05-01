const { registerWebhook } = require('./shared');

const args = process.argv.slice(2);
const url = args[0];

const main = async () => {
  try {
    const response = await registerWebhook(url);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

main();
