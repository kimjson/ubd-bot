'use strict';

const fetch = require('node-fetch');
const moment = require('moment');
const qs = require('qs');

const { removeWhiteSpaces } = require('../shared/utils');

const { KOFIC_API_KEY, KOFIC_API_BASE_URL } = process.env;

module.exports.getBoxOfficeListByDate = async (date = moment().subtract(1, 'day')) => {
  const queryString = qs.stringify({
    key: KOFIC_API_KEY,
    targetDt: date.format('YYYYMMDD'),
  });

  return fetch(`${KOFIC_API_BASE_URL}/boxoffice/searchDailyBoxOfficeList.json?${queryString}`)
    .then(response => {
      return response.json()
    })
    .then(json => json.boxOfficeResult.dailyBoxOfficeList);
}

module.exports.getAudiencesByMovieTitle = async (title) => {
  const titleQuery = removeWhiteSpaces(title);

  return this.getBoxOfficeListByDate()
    .then(list => {
      const boxOfficeOfTheMovie = list
        .find(item => removeWhiteSpaces(item.movieNm) === titleQuery);

      return boxOfficeOfTheMovie && boxOfficeOfTheMovie.audiAcc;
    });
}
