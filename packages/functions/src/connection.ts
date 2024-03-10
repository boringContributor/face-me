import { APIGatewayProxyHandler } from "aws-lambda";
import zod from 'zod'
import { zu } from 'zod_utilz'
import * as Connection from '@face-me/core/connection'
import { StartConnection } from "./validation";

export const main: APIGatewayProxyHandler = async (event) => {
  const connection = StartConnection.parse(event)
  const { stage, domainName } = event.requestContext;

  await Connection.update({ connection_id: connection.requestContext.connectionId, status: connection.body.data.status, peer_id: connection.body.data.peerId });

  if(connection.body.data.status === 'available') {
    await Connection.enqueueMatching({ connection_id: connection.requestContext.connectionId, user_id: connection.body.data.userId, endpoint: `${domainName}/${stage}` })
  }
  return { statusCode: 200, body: "Status updated to available" };
}; 
