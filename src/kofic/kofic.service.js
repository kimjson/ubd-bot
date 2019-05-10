'use strict';

const fetch = require('node-fetch');
const request = require('request-promise');
const qs = require('qs');

const { removeWhiteSpaces } = require('../shared/utils');
const { moment } = require('../shared/utils/moment');

const { configService } = require('../config/config.service');

const KOFIC_API_BASE_URL = configService.get('KOFIC_API_BASE_URL');
const KOFIC_API_KEY = configService.get('KOFIC_API_KEY');

class KoficService {
  getBoxOfficeListByDate = async (date = moment().subtract(1, 'day')) => {
    const queryString = qs.stringify({
      key: KOFIC_API_KEY,
      targetDt: date.format('YYYYMMDD'),
    });

    return fetch(`${KOFIC_API_BASE_URL}/boxoffice/searchDailyBoxOfficeList.json?${queryString}`)
      .then(response => {
        return response.json()
      })
      .then(json => json.boxOfficeResult.dailyBoxOfficeList);
  };

  getAudiencesByMovieTitle = async (title) => {
    const titleQuery = removeWhiteSpaces(title);

    return this.getBoxOfficeListByDate()
      .then(list => {
        const boxOfficeOfTheMovie = list
          .find(item => removeWhiteSpaces(item.movieNm) === titleQuery);

        return boxOfficeOfTheMovie && boxOfficeOfTheMovie.audiAcc;
      });
  };

  getWeeklyBoxOffice = async (date) => {
    const options = {
      json: true,
    };

    return request.get({
      ...options,
      url: `${KOFIC_API_BASE_URL}/boxoffice/searchWeeklyBoxOfficeList.json`,
      qs: {
        key: KOFIC_API_KEY,
        targetDt: date.format('YYYYMMDD'),
      },
    });
  }
}

exports.koficService = new KoficService();
