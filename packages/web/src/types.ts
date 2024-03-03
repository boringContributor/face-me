import Peer, { DataConnection, MediaConnection } from "peerjs";

export type Message = {
    sender: "local" | "remote";
    content: string;
    timestamp: string;
  }

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
  }