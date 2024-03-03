import Peer, { DataConnection, MediaConnection } from "peerjs";
import zod from "zod";


export const Message = zod.object({
    sender: zod.union([zod.literal("local"), zod.literal("remote")]),
    content: zod.string(),
    timestamp: zod.string(),
    type: zod.union([zod.literal("message"), zod.literal("hang-up")])
})

export type Message = zod.infer<typeof Message>

export  type UseMeetStore = {
    error: null | { name: string; message: string };
    peer: null | Peer;
    currentStream: null | MediaStream;
    currentUser: null | string;
    remoteStream: null | MediaStream;
    remoteUser: null | string;
    mediaConnection: MediaConnection | null;
    messages: Array<Message>;
    dataConnection: null | DataConnection;
    hasOpenConnection: boolean;
    userToCall: string | null;
  }