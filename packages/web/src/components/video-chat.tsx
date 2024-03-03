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
                <input type="text" placeholder="Remote ID" onInput={e => setStore("userToCall", e.target.value)} />
                <button onClick={connectWithUser}>Connect</button>

                <Show when={store.hasOpenConnection}>
                    <button onClick={stopCall}>Stop</button>
                </Show>
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

