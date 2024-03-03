import { Show } from "solid-js";
import useMeet from "../hooks/use-meet";
import { Stream } from "./stream";
import { TextChat } from "./text-chat";
import { FiCameraOff } from 'solid-icons/fi'
import { FiCamera } from 'solid-icons/fi'
import { AiFillAudio } from 'solid-icons/ai'
import { AiOutlineAudioMuted } from 'solid-icons/ai'

export const VideoChat = () => {

    const { setStore, store, connectWithUser, stopCall, sendMessage,toggleVideo, toggleMute  } = useMeet()

    return (
        <div class="p-4 grid gap-5">
            <div class="my-5 border rounded-lg shadow-sm px-10">
                <div>Your ID: {store.currentUser}</div>
                <input type="text" placeholder="Remote ID" onInput={e => setStore("userToCall", e.target.value)} />
                <button onClick={connectWithUser}>Connect</button>
                <Show when={store.hasOpenConnection}>
                    <button onClick={stopCall}>Stop</button>
                </Show>
                <div class="m-5 border flex">

               
               <div>
                <Show when={store.cameraEnabled}>
                    <button class="m-5" onClick={toggleVideo}>
                    <FiCameraOff />
                    </button>
                   
                </Show>
                <Show when={!store.cameraEnabled}>
                    <button class="m-5" onClick={toggleVideo}>
                    <FiCamera />
                    </button>
                </Show>
                </div>
                <div>
                <Show when={store.audioEnabled}>
                    <button class="m-5" onClick={toggleMute}>
                    <AiFillAudio />
                    </button>
                </Show>
                <Show when={!store.audioEnabled}>
                    <button class="m-5" onClick={toggleMute}>
                    <AiOutlineAudioMuted />
                    </button>
                </Show>

                </div>
                
                </div>
            </div>
            <div>
                <Show when={store.hasOpenConnection}>
                    <p class="">You are connected with {store.remoteUser}</p>
                </Show>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <Stream muted  stream={store.currentStream} />
                <Stream muted={false} stream={store.remoteStream} />
            </div>

            <div>
                <TextChat messages={store.messages} sendMessage={sendMessage} />
            </div>
        </div>

    );
}

