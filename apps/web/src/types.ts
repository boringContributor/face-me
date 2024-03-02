import Peer, { DataConnection } from "peerjs";

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
    incommingCall: boolean;
    messages: Array<Message>;
    connection: null | DataConnection;
  
  }