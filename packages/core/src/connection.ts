export * as Todo from "./connection";
import { management_api, sqs } from "./aws-clients";
import { Connection, ConnectionService } from "./db";
import { Queue } from 'sst/node/queue'

type UserMatch = {
  connect_to: string,
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

export async function matchUser(params: { connection_id: string, user_id: string }) {
  const available_user = await Connection.query.by_status({
    status: 'available'
  }).go()

  // TODO query on db level
  const users_to_match = available_user.data.filter(user => user.user_id !== params.user_id)

  console.log('users_to_match', { users_to_match, available_user })
  const user_to_match = getRandomItem(users_to_match)

  console.log('user_to_match', user_to_match)
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
    connect_to: params.connection_id,
    remote_peer_id: user_to_match.peer_id!
  })
}

const notifyUserAboutMatch = async (user: UserMatch) => {
  // WebRTC signaling -> only one user needs to be notified
  await management_api.postToConnection({
    ConnectionId: user.connect_to,
    Data: JSON.stringify({
      action: 'match',
      data: {
        remote_connection_id: user.connect_to,
        remote_peer_id: user.connect_to
      }
    })
  })
}

export async function enqueueMatching(params: { connection_id: string, user_id: string }) {
  await sqs.sendMessage({
    MessageGroupId: 'connection_id',
    QueueUrl: Queue["matching-queue"].queueUrl,
    MessageBody: JSON.stringify({
      connection_id: params.connection_id,
      user_id: params.user_id
    })
  })
}

function getRandomItem<T>(items: T[]): T {
  // Generate a random index based on the array length
  const randomIndex = Math.floor(Math.random() * items.length);
  // Return the item at the random index
  return items[randomIndex];
}
