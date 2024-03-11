import { APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import * as Connection from '@face-me/core/connection'
import { StartConnection } from "../validation";

export const main: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const connection = StartConnection.parse(event)
  const websocket_endpoint = `https://${connection.requestContext.domainName}/${connection.requestContext.stage}`

  await Connection.update({ connection_id: connection.requestContext.connectionId, status: connection.body.data.status, peer_id: connection.body.data.peerId });

  if(connection.body.data.status === 'available') {
    await Connection.enqueueMatching({ connection_id: connection.requestContext.connectionId, user_id: connection.body.data.userId, endpoint: websocket_endpoint })
  }

  if(connection.body.data.status === 'pending') {
    await Connection.stopMatch(connection.requestContext.connectionId)
  }
  return { statusCode: 200 };
}; 
