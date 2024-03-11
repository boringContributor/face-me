import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { SQS } from '@aws-sdk/client-sqs'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const dynamoClient = new DynamoDB()

export const ddb = DynamoDBDocument.from(dynamoClient)
export const sqs = new SQS()