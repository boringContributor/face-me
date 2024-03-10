
import { APIGatewayProxyHandler } from "aws-lambda";
import * as Connections from '@face-me/core/connection'

export const main: APIGatewayProxyHandler = async (event) => {
    if(!event.requestContext.connectionId) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "ConnectionId not found"
            })
        }
    }

    await Connections.connect(event.requestContext.connectionId);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Connected",
            connectionId: event.requestContext.connectionId
        })
    }
};