const { moment } = require('../src/shared/utils/moment');

const { koficService } = require('../src/kofic/kofic.service');
const { MovieService } = require('../src/movie/movie.service');

const main = async () => {
  const args = process.argv.slice(2);
  const from = moment(args[0]);
  const to = moment(args[1]);

  const range = moment.range(from, to);
  const weeks = Array.from(range.by('week')).reverse();

  const movieService = await MovieService.build();

  for (let week of weeks) {
    const response = await koficService.getWeeklyBoxOffice(week);
    const { showRange, weeklyBoxOfficeList } = response.boxOfficeResult;

    const tokens = showRange.split('~');
    const endOfWeek = moment(tokens[1]);
    const countedAt = endOfWeek.toDate();

    for (let boxOffice of weeklyBoxOfficeList) {
      const { movieNm: title, audiAcc: audiences } = boxOffice;
      const movie = { title, audiences: Number(audiences), countedAt }

      await movieService.findOrUpsertOne(movie);
    }
  }

  movieService.quit();
  process.exit();
}

main();