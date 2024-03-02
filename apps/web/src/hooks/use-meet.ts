import Peer, { DataConnection } from "peerjs";
import { createEffect, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-toast";
import { makeAudioPlayer } from '@solid-primitives/audio'

type Message = {
  sender: "local" | "remote";
  content: string;
  timestamp: Date;
}

type Store = {
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

const { play: playNewMsgSound } = makeAudioPlayer("../../public/new_msg.mp3");

export default function useMeet() {
  const [store, setStore] = createStore<Store>({
    error: null,
    peer: null,
    currentStream: null,
    currentUser: null,
    remoteStream: null,
    remoteUser: null,
    incommingCall: false,
    messages: [],
    connection: null
  });

  onMount(async () => {
    await requestMediaAccess();
  });

  createEffect(() => {
    // random 5 digit number
    const randomId = Math.floor(10000 + Math.random() * 90000).toString();

    const peerInstance = new Peer(randomId);

    peerInstance.on('open', id => {
      toast.success(`Created new session with id: ${id}`)
      setStore("currentUser", id);
    });

    peerInstance.on('error', (err) => {
      toast.error(`Error: ${err.message}`);
      console.error(err);
    });

    peerInstance.on('disconnected', () => {
      toast.success(`Disconnected from server`);
    })

    peerInstance.on('call', async incomingCall => {
      setStore('incommingCall', true);
      toast.success("Incoming call...");

      try {
        if (!store.currentStream) {
          await requestMediaAccess();
        }


        incomingCall.answer(store.currentStream!);
        setStore('currentStream', store.currentStream);

        incomingCall.on('stream', remoteStream => {
          console.log('Media connection successfully established');
          setStore('remoteStream', remoteStream);
        });
      }
      
      catch (error) {
        console.error("media access permission error:-", error);
        // @ts-ignore
        setStore("error", { name: error.name, message: error.message });
      }
    
    });

    peerInstance.on('connection', dataConnection => {
      dataConnection.on('data', message => {
          playNewMsgSound();
          setStore("messages", [...store.messages, { ...message as Message, sender: "remote" }]);
      });
  });

    setStore("peer", peerInstance);
  });


  async function requestMediaAccess() {
    console.info("request media access permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
        preferCurrentTab: true
      });
      console.info("media connected successfully.");

      setStore("currentStream", stream);
    } catch (error) {
      console.error("media access permission error:-", error);
      // @ts-ignore
      setStore("error", { name: error.name, message: error.message });
    }
  }


  const sendMessage = (content: string) => {
    const message = { sender: "local", content, timestamp: new Date() } as const;
    store.connection?.send(message);
    setStore("messages", [...store.messages, message]);
  };

  const connectWithUser = () => {
    console.info(`start new call with ${store.remoteUser}`);

    const call = store.peer?.call(store.remoteUser!, store.currentStream!); // refers to media exchange e.g. video, audio
    const connection = store.peer?.connect(store.remoteUser!); // refers to data exchange e.g. text messages

    connection?.on('open', () => {
      setStore('connection', connection); 
    });

    call?.on('stream', remoteStream => {
      setStore('remoteStream', remoteStream);
    });

    connection?.on('close', () => {
      setStore('connection', null);
      setStore('messages', []);
    });

    call?.on('close', () => {
      setStore('remoteStream', null);
      setStore('incommingCall', false);
      setStore('messages', []);
    });
  };

  const stopCall = () => {
    store.peer?.disconnect();
    cleanUserMediaStream();
  }

  function cleanUserMediaStream() {
    if (store.currentStream) {
      store.currentStream.getTracks().forEach((track) => track.stop());
    }
  }

  return {
    store,
    setStore,
    stopCall,
    connectWithUser,
    sendMessage
  };
}