# UBD Twitter Bot

## 사전 준비 사항

* [nvm](https://github.com/creationix/nvm)이 설치되어 있어야 합니다.

## 트위터 앱 생성 및 연동

[트위터 개발자 계정 생성](https://docs.aws.amazon.com/ko_kr/gettingstarted/latest/emr/getting-started-emr-sentiment-create-twitter-account.html) 의 내용을 참고하세요.

## MongoDB Atlas와의 연동

데이터베이스는 MongoDB를 사용하며, 인스턴스는 관리형 클라우드 서비스인 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)를 이용합니다. 자세한 연동 방법은 [Free Tier Serverless MongoDB with AWS Lambda and MongoDB Atlas](https://mattwelke.com/2019/02/18/free-tier-serverless-mongodb-with-aws-lambda-and-mongodb-atlas.html) 을 참조하세요.

## 환경 변수 설정

.env.example.json을 참조하여 .env.json을 작성해야 합니다.

## AWS 프로파일 등록

다음 코드를 .bashrc 등에 추가합니다. string에 해당하는 값은 서버리스를 배포하는데 충분한 권한을 가진 사용자의 보안 자격 증명 페이지에 접속해서 가져올 수 있습니다.

```bash
export AWS_ACCESS_KEY_ID=string
export AWS_SECRET_ACCESS_KEY=string
```

쉘을 재시작하거나, 현재 쉘에서 다음 명령어를 입력합니다.

```bash
$ source ~/.bashrc
```

## 배포 및 실행

위 단계를 모두 수행하셨다면, 다음 커맨드로 람다 함수를 실행해보실 수 있습니다.

```bash
# cwd: $PROJECT_ROOT
$ nvm use
$ npm install
$ npm run deploy
$ sls invoke -f tweetRandomQuote  # 또는 AWS 콘솔에 접속하여 직접 테스트하실 수 있습니다
```
