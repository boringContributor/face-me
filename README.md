# Face Me

## Omegle Clone Built with SolidJS and SST

Example project how to build a potentially scalable video chat application similar to Omegle using SolidJS and SST. Demonstrate the basic usage of WebRTC and signaling. Uses SST to manage the backend infrastructure, by deploying a websocket api which acts as a signaling server through lambda. The signaling server is used to establish a connection between two clients and to exchange the necessary information to establish a WebRTC connection. A queue is used to manage the connections and to pair clients together. 

The matching algorithm is very basic and can be improved/extended. The project is designed to demo WebRTC and SST, and not to be a production ready application.

Important reminder: there is no authentication or moderation in this application. It is not suitable for production use. In order to use this in production you would need to add authentication, authorization and moderation.

Protecting the endpoint is also important, as it is currently open to the public.

### Technologies Used:
- SolidJS
- SST (WebsocketAPI, DynamoDB, Lambda, SQS)
- TailwindCSS
- Vite
- WebRTC
- ElectroDB


### Some ideas for improvement:
- Add authentication or at least protect ws endpoint
- Add moderation
- Improve matching algorithm
- Give feedback to the user when the other user disconnects
- Give feedback when matching is in progress
- Give feedback when no match was found
- Add a report button
- Add a captcha to prevent bots
- Add a rate limiter
- Add filter options e.g. by language, topics, interests etc.