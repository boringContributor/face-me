import zod from 'zod'
import { zu } from 'zod_utilz'

export const StartConnection = zod.object({
    requestContext: zod.object({
      routeKey: zod.literal('connection'),
      messageId: zod.string(),
      eventType: zod.literal('MESSAGE'),
      extendedRequestId: zod.string(),
      requestTime: zod.string(),
      messageDirection: zod.literal('IN'),
      stage: zod.literal('dev'),
      connectedAt: zod.number(),
      requestTimeEpoch: zod.number(),
      identity: zod.object({
        userAgent: zod.string(),
        sourceIp: zod.string()
      }),
      requestId: zod.string(),
      domainName: zod.string(),
      connectionId: zod.string(),
      apiId: zod.string()
    }),
    body: zu.stringToJSON().pipe(zod.object({ action: zod.enum(['connection']), data: zod.object({ userId: zod.string(), status: zod.enum(['available', 'pending']), peerId: zod.string() }) })),
  })
  