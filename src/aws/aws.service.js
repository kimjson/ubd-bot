class AwsService {
  isWarmerEvent = (event) => event.source === 'aws.events'
}

exports.awsService = new AwsService();
