import { Queue, StackContext, Table, WebSocketApi, toCdkDuration } from "sst/constructs";
import {  } from "aws-cdk-lib";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";

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
        retentionPeriod: toCdkDuration(`1 days`),
        visibilityTimeout: toCdkDuration(`5 seconds`),
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

  // matchingQueue.consumerFunction?.addPermission("postToConnection", {
  //   principal: new ServicePrincipal("apigateway.amazonaws.com"),
  //   action: "execute-api:ManageConnections",
  //   sourceArn: `arn:aws:execute-api:${stack.region}:${stack.account}:${api.id}/*`,
  // });
  matchingQueue.consumerFunction?.addToRolePolicy(new PolicyStatement({
    resources: [
      `*`
    ],
    actions: [
      'execute-api:ManageConnections',
    ],
  }));

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
