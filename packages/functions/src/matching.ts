
import { SQSHandler } from "aws-lambda";
import * as Connection from '@face-me/core/connection'
import zod from 'zod'

const UserConsumer = zod.object({
    connection_id: zod.string(),
    user_id: zod.string(),
})

export const matchUserConsumer: SQSHandler = async (event) => {
    const user = UserConsumer.parse(JSON.parse(event.Records[0].body));
    return await Connection.matchUser({
        connection_id: user.connection_id,
        user_id: user.user_id
    });
};