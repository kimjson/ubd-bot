'use strict';

const crypto = require('crypto');
const Twitter = require('twitter');
const request = require('request-promise');

const { configService } = require('../config/config.service');
const { textService } = require('../text/text.service');
const { UBD } = require('./twitter.constants');

const NODE_ENV = configService.getNodeEnv();
const TWITTER_CONSUMER_KEY = configService.get('TWITTER_CONSUMER_KEY');
const TWITTER_CONSUMER_SECRET = configService.get('TWITTER_CONSUMER_SECRET');
const TWITTER_ACCESS_TOKEN_KEY = configService.get('TWITTER_ACCESS_TOKEN_KEY');
const TWITTER_ACCESS_TOKEN_SECRET = configService.get('TWITTER_ACCESS_TOKEN_SECRET');
const TWITTER_BOT_USERNAME = configService.get('TWITTER_BOT_USERNAME');
const TWITTER_API_BASE_URL = configService.get('TWITTER_API_BASE_URL');

const client = new Twitter({
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token_key: TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
});

class TwitterService {
  constructor() {
    this.request = request.defaults({
      baseUrl: TWITTER_API_BASE_URL,
      oauth: {
        consumer_key: TWITTER_CONSUMER_KEY,
        consumer_secret: TWITTER_CONSUMER_SECRET,
        token: TWITTER_ACCESS_TOKEN_KEY,
        token_secret: TWITTER_ACCESS_TOKEN_SECRET,
      },
      json: true,
    });
  }

  static build() {
    return new TwitterService();
  }

  parseTweetCreateEvent(tweetCreateEvent) {
    const {
      id_str: mentionId,
      text,
      in_reply_to_screen_name: toUsername,
      user: { screen_name: fromUsername }
    } = tweetCreateEvent;

    if (toUsername === TWITTER_BOT_USERNAME) return { mentionId, text, toUsername, fromUsername };
    return undefined;
  }

  isMentionForBot(event) {
    const { in_reply_to_screen_name: toUsername } = event;
    return toUsername === TWITTER_BOT_USERNAME;
  }

  async updateStatus({ text, statusId }) {
    return new Promise((resolve, reject) => {
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
  }

  async computeUbdAndReply(parsedEvent, movie) {
    if (movie && Number.isFinite(movie.audiences)) {
      const { fromUsername, mentionId } = parsedEvent;
      const { audiences, title } = movie;

      const audiencesInUBD = audiences / UBD;
      const formattedAudiences = textService.formatAudiences(audiences);
      const formattedAudiencesInUBD = textService.formatUBD(audiencesInUBD);

      const replyText = textService.buildReply(
        fromUsername, textService.formatMomentForTweet(), title,
        formattedAudiencesInUBD, formattedAudiences,
      );

      return this.updateStatus({ text: replyText, statusId: mentionId });
    }

    return undefined;
  }

  getMovieTitleFromText(text) {
    const tokens = text.split(`@${TWITTER_BOT_USERNAME} `);

    if (!tokens || tokens.length === 0) throw Error('Invalid mention');

    return tokens[tokens.length - 1];
  }

  buildCrcPayload(crcToken) {
    return {
      response_token: `sha256=${crypto.createHmac('sha256', TWITTER_CONSUMER_SECRET).update(crcToken).digest('base64')}`,
    };
  }

  async triggerCRC (webhookId) {
    return this.request.put({ url: `/account_activity/all/${NODE_ENV}/webhooks/${webhookId}.json` });
  };

  async registerWebhook(webhookURL) {
    return this.request.post({ url: `/account_activity/all/${NODE_ENV}/webhooks.json`, qs: { url: webhookURL } })
  };

  async getWebhooks() {
    return this.request({ url: `/account_activity/all/webhooks.json` })
  };

  async addSubscription() {
    return this.request.post({ url: `/account_activity/all/${NODE_ENV}/subscriptions.json` })
  };
}

exports.TwitterService = TwitterService;
exports.twitterService = TwitterService.build();
