const moment = require('moment-timezone');

exports.removeWhiteSpaces = (str) => {
  return str.replace(/\s/g, '');
};

exports.parseDate = (date, format = 'YYYY-MM-DD') => {
  return moment.tz(date, "Asia/Seoul");
}

exports.formatDate = (date, format = 'YYYYMMDD') => {
  return date.format(format);
}
