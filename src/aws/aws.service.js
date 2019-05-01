module.exports.isWarmerEvent = (event) => {
  return event.source === 'aws.events'
}
