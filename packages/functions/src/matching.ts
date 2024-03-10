
import { SQSHandler } from "aws-lambda";
import * as Connection from '@face-me/core/connection'
import zod from 'zod'
import pRetry from 'p-retry'

const UserConsumer = zod.object({
    connection_id: zod.string(),
    user_id: zod.string(),
})

export const matchUserConsumer: SQSHandler = async (event) => {
    const user = UserConsumer.parse(JSON.parse(event.Records[0].body));
    await pRetry(async () => {
        await Connection.matchUser({
            connection_id: user.connection_id,
            user_id: user.user_id
        })
    }, { retries: 10, randomize: true, maxRetryTime: 10000, onFailedAttempt(error) {
        console.log('Failed to match user', { error })
    },});
};