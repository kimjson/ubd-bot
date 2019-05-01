const { triggerCRC } = require('./shared');

const args = process.argv.slice(2);
const webhookId = args[0];

const main = async () => {
  try {
    const response = await triggerCRC(webhookId);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

main();