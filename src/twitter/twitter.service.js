'use strict';

const crypto = require('crypto');
const Twitter = require('twitter');
const request = require('request-promise');

const { configService } = require('../config/config.service');

const NODE_ENV = configService.getNodeEnv();
const TWITTER_CONSUMER_KEY = configService.get('TWITTER_CONSUMER_KEY')
const TWITTER_CONSUMER_SECRET = configService.get('TWITTER_CONSUMER_SECRET')
const TWITTER_ACCESS_TOKEN_KEY = configService.get('TWITTER_ACCESS_TOKEN_KEY')
const TWITTER_ACCESS_TOKEN_SECRET = configService.get('TWITTER_ACCESS_TOKEN_SECRET')
const TWITTER_BOT_USERNAME = configService.get('TWITTER_BOT_USERNAME')

const client = new Twitter({
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token_key: TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
});

const options = {
  oauth: {
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    token: TWITTER_ACCESS_TOKEN_KEY,
    token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  },
  json: true,
};

class TwitterService {
  updateStatus = async ({ text, statusId }) => new Promise((resolve, reject) => {
    const status = (NODE_ENV === 'production')
      ? text
      : `${text} - ${NODE_ENV} 환경에서 테스트 중.`;

    const params = statusId
      ? { status, in_reply_to_status_id: statusId }
      : { status };

    client
      .post('statuses/update', params)
      .then(tweet => {
        resolve(tweet);
      })
      .catch(error => reject(error));
  });

  getMovieTitleFromText = (text) => {
    const tokens = text.split(`@${TWITTER_BOT_USERNAME} `);

    if (!tokens || tokens.length === 0) throw Error('Invalid mention');

    return tokens[tokens.length - 1];
  }

  buildCrcPayload = (crcToken) => ({
    response_token: `sha256=${crypto.createHmac('sha256', TWITTER_CONSUMER_SECRET).update(crcToken).digest('base64')}`,
  })

  triggerCRC = async (webhookId) => {
    return request.put({
      ...options,
      url: `${TWITTER_API_BASE_URL}/account_activity/all/${NODE_ENV}/webhooks/${webhookId}.json`,
    });
  };

  registerWebhook = async (webhookURL) => {
    return request.post({
      ...options,
      url: `${TWITTER_API_BASE_URL}/account_activity/all/${NODE_ENV}/webhooks.json`,
      qs: { url: webhookURL },
    })
  };

  getWebhooks = async () => {
    return request.get({
      ...options,
      url: `${TWITTER_API_BASE_URL}/account_activity/all/webhooks.json`,
    })
  };

  addSubscription =  async () => {
    return request.post({
      ...options,
      url: `${TWITTER_API_BASE_URL}/account_activity/all/${NODE_ENV}/subscriptions.json`,
    })
  };
}

exports.twitterService = new TwitterService();
