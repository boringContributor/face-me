import Peer from "peerjs";
import { createEffect, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { toast } from "solid-toast";
import { makeAudioPlayer } from '@solid-primitives/audio'
import type { Message, UseMeetStore,  } from "../types";

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
    mediaConnection: null
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
    console.info(`start new call with ${store.remoteUser}`);

    const mediaConnection = store.peer?.call(store.remoteUser!, store.currentStream!); // refers to media exchange e.g. video, audio
    const dataConnection = store.peer?.connect(store.remoteUser!); // refers to data exchange e.g. text messages

    dataConnection?.on('open', () => {
      setStore('dataConnection', dataConnection); 
    });

    mediaConnection?.on('stream', remoteStream => {
      setStore('remoteStream', remoteStream);
    });

    dataConnection?.on('close', () => {
      setStore('dataConnection', null);
      setStore('messages', []);
    });

    mediaConnection?.on('close', () => {
      setStore('remoteStream', null);
      setStore('mediaConnection', null);
      setStore('messages', []);
    });
  };

  const stopCall = () => {
    if(store.remoteStream) {
      for (const track of store.remoteStream.getTracks()) {
        track.stop();
      }
      setStore("remoteStream", null);
    }

    if(store.dataConnection) {
      store.dataConnection.close();
      setStore("dataConnection", null);
    }

    if(store.mediaConnection) {
      store.mediaConnection.close();
      setStore("mediaConnection", null);
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