import { Queue, StackContext, Table, WebSocketApi, toCdkDuration } from "sst/constructs";

export function API({ stack }: StackContext) {
  const table = new Table(stack, "Connections", {
    fields: {
      pk: 'string',
      sk: 'string',
      gsi1pk: 'string',
      gsi1sk: 'string',
    },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" },
    globalIndexes: {
      'gsi1pk-gsi1sk-index': { partitionKey: "gsi1pk", sortKey: "gsi1sk", projection: "all" },
    }
  });

  const matchingQueue = new Queue(stack, "matching-queue", {
    consumer: {
      function: "packages/functions/src/matching.matchUserConsumer",
      cdk: {
        eventSource: {
          batchSize: 1,
        },
      },
    },
    cdk: {
      queue: {
        fifo: true,
        contentBasedDeduplication: true,
        retentionPeriod: toCdkDuration(`7 days`),
        visibilityTimeout: toCdkDuration(`30 seconds`),
        receiveMessageWaitTime: toCdkDuration(`20 seconds`),
      }, 
    },
  })

  matchingQueue.bind([table]);

  const api = new WebSocketApi(stack, "websocket-api", {
    defaults: {
      function: {
        bind: [table, matchingQueue],
      },
    },
    routes: {
      $connect: "packages/functions/src/connect.main",
      $disconnect: "packages/functions/src/disconnect.main",
      connection: "packages/functions/src/connection.main",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
