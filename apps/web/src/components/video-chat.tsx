import { Show } from "solid-js";
import useMeet from "../hooks/use-meet";
import { Stream } from "./stream";
import { TextChat } from "./text-chat";

export const VideoChat = () => {

    const { setStore, store, connectWithUser, stopCall, sendMessage,  } = useMeet()

    return (
        <div class="p-4 grid gap-5">
            <div class="my-5 border rounded-lg shadow-sm px-10">
                <div>Your ID: {store.currentUser}</div>
                <input type="text" placeholder="Remote ID" onInput={e => setStore("remoteUser", e.target.value)} />

                <p>You are connected with {store.remoteUser}</p>
                <button onClick={connectWithUser}>Connect</button>


                <Show when={store.remoteUser}>
                    <button onClick={stopCall}>Stop</button>
                </Show>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <Stream  stream={store.currentStream} />
                <Stream  stream={store.remoteStream} />
            </div>

            <div>
                <TextChat messages={store.messages} sendMessage={sendMessage} />
            </div>
        </div>

    );
}

