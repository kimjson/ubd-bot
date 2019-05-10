const request = require('request-promise');

const envJson = require('../.env.json');

const {
  UBD_BOT_ENV,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_API_BASE_URL,
} = envJson;

const options = {
  oauth: {
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    token: TWITTER_ACCESS_TOKEN_KEY,
    token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  },
  json: true,
};

exports.triggerCRC = async (webhookId) => {
  return request.put({
    ...options,
    url: `${TWITTER_API_BASE_URL}/account_activity/all/${UBD_BOT_ENV}/webhooks/${webhookId}.json`,
  });
};

exports.registerWebhook = async (webhookURL) => {
  return request.post({
    ...options,
    url: `${TWITTER_API_BASE_URL}/account_activity/all/${UBD_BOT_ENV}/webhooks.json`,
    qs: { url: webhookURL },
  })
}

exports.getWebhooks = async () => {
  return request.get({
    ...options,
    url: `${TWITTER_API_BASE_URL}/account_activity/all/webhooks.json`,
  })
}

exports.addSubscription =  async () => {
  return request.post({
    ...options,
    url: `${TWITTER_API_BASE_URL}/account_activity/all/${UBD_BOT_ENV}/subscriptions.json`,
  })
}
