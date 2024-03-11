export * as Todo from "./connection";
import { ApiGatewayManagementApi, ApiGatewayManagementApiServiceException, GoneException } from "@aws-sdk/client-apigatewaymanagementapi";
import { sqs } from "./aws-clients";
import { Connection, ConnectionService } from "./db";
import { Queue } from 'sst/node/queue'

type UserMatch = {
  remote_peer_id: string
}

export async function connect(connection_id: string) {
  return await Connection.put({
    connection_id,
    status: "pending",

  }).go()
}

export async function update(params: { connection_id: string, status: Connection['status'], peer_id: string }) {
  return await Connection.update({
    connection_id: params.connection_id,
  }).set({
    status: params.status,
    peer_id: params.peer_id
  }).go()
}

export async function checkStatus(connection_id: string) {
  return await Connection.get({ connection_id }).go()
}
export async function disconnect(connection_id: string) {
  
  const deleted_connection = await Connection.delete({ connection_id }).go({ response: 'all_old' })

  if(deleted_connection.data?.connected_to) {
    await Connection.update({
      connection_id: deleted_connection.data.connected_to
    }).set({
      status: 'available',
      connected_to: undefined
    }).go()
  }
}

export async function matchUser(params: { connection_id: string, user_id: string, endpoint: string }) {
  const available_user = await Connection.query.by_status({
    status: 'available'
  }).go()

  // TODO query on db level
  const users_to_match = available_user.data.filter(user => user.user_id !== params.user_id)

  const user_to_match = getRandomItem(users_to_match)

  console.log('user_to_match', { one: user_to_match, two: params.user_id })
  if (!user_to_match) {
    throw new Error('No user to match')
  }

  await ConnectionService.transaction
    .write(({ connection }) => [
      connection.update({
        connection_id: params.connection_id
      }).set({
        status: 'unavailable',
        connected_to: user_to_match.connection_id
      }).commit(),
      connection.update({
        connection_id: user_to_match.connection_id
      }).set({
        status: 'unavailable',
        connected_to: params.connection_id
      }).commit()
    ])
    .go();

  // TODO types for peer_id
  await notifyUserAboutMatch({
    endpoint: params.endpoint,
    connection_id: params.connection_id,
    remote_user: {
      remote_peer_id: user_to_match.peer_id!
  }})
}

const notifyUserAboutMatch = async (params: { connection_id: string, remote_user: UserMatch, endpoint: string}) => {
  // WebRTC signaling -> only one user needs to be notified
  const management_api = new ApiGatewayManagementApi({
    endpoint: params.endpoint
  })
  try {
    await management_api.postToConnection({
      ConnectionId: params.connection_id,
      Data: JSON.stringify({
        action: 'match',
        data: {
          remote_peer_id: params.remote_user.remote_peer_id
        }
      })
    })
  }catch(error) {
    
     if (isApiGatewayError(error) && error.$metadata.httpStatusCode === 410) {
      console.log(`Found disconnected client`, { error, params });
      await Connection.delete({ connection_id: params.connection_id }).go()
    } else {
      console.error(`Error sending message to client`, {error, params});
    }
  }

}

const isApiGatewayError = (error: unknown): error is ApiGatewayManagementApiServiceException => {
  return error instanceof ApiGatewayManagementApiServiceException;
}

export async function enqueueMatching(params: { connection_id: string, user_id: string, endpoint: string }) {
  await sqs.sendMessage({
    MessageGroupId: 'connection_id',
    QueueUrl: Queue["matching-queue"].queueUrl,
    MessageBody: JSON.stringify({
      connection_id: params.connection_id,
      user_id: params.user_id,
      endpoint: params.endpoint
    })
  })
}

function getRandomItem<T>(items: T[]): T {
  // Generate a random index based on the array length
  const randomIndex = Math.floor(Math.random() * items.length);
  // Return the item at the random index
  return items[randomIndex];
}
