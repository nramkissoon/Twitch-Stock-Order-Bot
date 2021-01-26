import AWS from 'aws-sdk'
import { PublishInput } from 'aws-sdk/clients/sns'
import { log, LOG_CONSTANTS } from './logging'

export const publishToSNS = async (topicARN: string, message: string) => {
  const params: PublishInput = {
    Message: message,
    TopicArn: topicARN
  };
  new AWS.SNS().publish(params, (err: AWS.AWSError, data: AWS.SNS.PublishResponse) => {
    if (err) log(`${LOG_CONSTANTS.SNS_PUBLISH}${LOG_CONSTANTS.COLON} ${err.time}${LOG_CONSTANTS.COLON} ${err.message}`)
    if (data) log(`${LOG_CONSTANTS.SNS_PUBLISH}${LOG_CONSTANTS.COLON} ${data.MessageId}`)
  });
}