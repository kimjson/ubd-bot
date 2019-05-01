const { addSubscription } = require('./shared');

const main = async () => {
  try {
    const response = await addSubscription();
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(error);
  }
}

main();
