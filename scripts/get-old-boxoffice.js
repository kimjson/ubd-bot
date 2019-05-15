const { moment } = require('../src/shared/utils/moment');

const { koficService } = require('../src/kofic/kofic.service');
const { MovieService } = require('../src/movie/movie.service');

const main = async () => {
  const args = process.argv.slice(2);
  const from = moment(args[0]);
  const to = moment(args[1]);

  const range = moment.range(from, to);
  const days = Array.from(range.by('day')).reverse();

  const movieService = await MovieService.build();

  for (let day of days) {
    const boxOfficeList = await koficService.findDailyBoxOfficeListByDate(day);
    const countedAt = day.toDate();

    console.log(`${day.format('YYYY-MM-DD')}: ${boxOfficeList.length || 0}개의 흥행 성적을 가져왔습니다.`);

    for (let boxOffice of boxOfficeList) {
      const { movieNm: title, audiAcc: audiences } = boxOffice;
      const movie = { title, audiences: Number(audiences), countedAt }

      await movieService.findOrUpsertOne(movie);
    }
  }

  movieService.quit();
  process.exit();
}

main();