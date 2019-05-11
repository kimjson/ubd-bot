class AwsService {
  static build() {
    return new AwsService();
  }

  isWarmerEvent(event) {
    return event.source === 'aws.events';
  }
}

exports.AwsService = AwsService;
exports.awsService = AwsService.build();
