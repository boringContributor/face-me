import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { SQS } from '@aws-sdk/client-sqs'
import { ApiGatewayManagementApi } from '@aws-sdk/client-apigatewaymanagementapi'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

const dynamoClient = new DynamoDB()

export const ddb = DynamoDBDocument.from(dynamoClient)
export const sqs = new SQS()
export const management_api = new ApiGatewayManagementApi()