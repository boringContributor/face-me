import Peer, { DataConnection, MediaConnection } from "peerjs";
import { createEffect, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-toast";
import { makeAudioPlayer } from '@solid-primitives/audio'
import type { Message, UseMeetStore, } from "../types";

const { play: playNewMsgSound } = makeAudioPlayer("../../public/new_msg.mp3");

export default function useMeet() {
  const [store, setStore] = createStore<UseMeetStore>({
    error: null,
    peer: null,
    currentStream: null,
    currentUser: null,
    remoteStream: null,
    remoteUser: null,
    dataConnection: null,
    messages: [],
    mediaConnection: null,
    hasOpenConnection: false,
    userToCall: null
  });

  onMount(async () => {
    await requestMediaAccess();
  });

  createEffect(() => {
    const hasOpenConnection = store.dataConnection !== null || store.mediaConnection !== null;
    setStore("hasOpenConnection", hasOpenConnection);
    if(store.mediaConnection?.peer) {
      setStore("remoteUser", store.mediaConnection?.peer);
    } else if (store.dataConnection?.peer) {
      setStore("remoteUser", store.dataConnection?.peer);
    }
    
    if (hasOpenConnection) {
      toast.success(`Connected to peer ${store.mediaConnection?.peer}`);
    }
  });

  createEffect(() => {
    // random 5 digit number
    const randomId = Math.floor(10000 + Math.random() * 90000).toString();

    const peerInstance = new Peer(randomId);

    peerInstance.on('open', id => {
      toast.success(`Created new session with id: ${id}`)
      setStore("currentUser", id);
    });

    peerInstance.on('close', () => {
      toast.error(`Connection closed`);
      setStore("currentUser", null);

    });
    peerInstance.on('error', (err) => {
      toast.error(`Error: ${err.message}`);
      console.error(err);
    });

    peerInstance.on('disconnected', () => {
      toast.success(`Disconnected from server`);
    })

    peerInstance.on('call', async mediaConnection => {
      setStore('mediaConnection', mediaConnection);
      toast.success("Incoming call...");

      try {
        if (!store.currentStream) {
          await requestMediaAccess();
        }


        mediaConnection.answer(store.currentStream!);

        mediaConnection.on('stream', remoteStream => {
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
        // @ts-ignore
        if (message.type === 'hang-up') {
          console.log('Hang-up signal received');
          cleanupConnections();
        }
      
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
    const message = { sender: "local", content, timestamp: new Date().toISOString() } as const;
    store.dataConnection?.send(message);
    setStore("messages", [...store.messages, message]);
  };

  const connectWithUser = () => {
    // Close existing connections first if they exist
    if (store.dataConnection) {
      store.dataConnection.close();
    }
    if (store.mediaConnection) {
      store.mediaConnection.close();
    }

    if(!store.userToCall) {
      toast.error("Please enter a valid user id to call");
      return;
    }

    const mediaConnection = store.peer?.call(store.userToCall, store.currentStream!); // refers to media exchange e.g. video, audio
    const dataConnection = store.peer?.connect(store.userToCall); // refers to data exchange e.g. text messages

    setupMediaConnection(mediaConnection!);
    setupDataConnection(dataConnection!);
  };

  const setupDataConnection = (dataConnection: DataConnection) => {
    dataConnection?.on('open', () => {
      setStore('dataConnection', dataConnection);
    });
  
    dataConnection?.on('close', () => {
      setStore('dataConnection', null);
      setStore('messages', []);
    });
  }
  
  const setupMediaConnection = (mediaConnection: MediaConnection) => {
    mediaConnection?.on('stream', remoteStream => {
      setStore('remoteStream', remoteStream);
    });

    mediaConnection?.on('close', () => {
      setStore('remoteStream', null);
      setStore('mediaConnection', null);
      setStore('messages', []);
    });
  }
  const stopCall = () => {
    if (store.dataConnection && store.dataConnection.open) {
      store.dataConnection.send({ type: 'hang-up' });
      console.log('Hang-up signal sent to the remote peer');
    }
    
    cleanupConnections();
  }


  const cleanupConnections = () => {
    if (store.remoteStream) {
      for (const track of store.remoteStream.getTracks()) {
        track.stop();
      }
      setStore("remoteStream", null);
    }

    if (store.dataConnection) {
      store.dataConnection.close();
      setStore("dataConnection", null);
    }
  
    // Close the media connection
    if (store.mediaConnection) {
      store.mediaConnection.close();
      setStore("mediaConnection", null);
    }
  
    setStore("messages", []);
  
    console.log('Connections and resources have been cleaned up');
  };
  
  return {
    store,
    setStore,
    stopCall,
    connectWithUser,
    sendMessage
  };
}

