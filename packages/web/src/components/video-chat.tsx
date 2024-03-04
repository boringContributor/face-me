import { Show } from "solid-js";
import useMeet from "../hooks/use-meet";
import { Controls } from "./controls";
import { Stream } from "./stream";
import { TextChat } from "./text-chat";

export const VideoChat = () => {
    const meet = useMeet()

    return (
        <div class="p-4 grid gap-5">
            <h1 class='text-center text-7xl'>Face Me</h1>
            <div>
                <Show when={meet.store.hasOpenConnection}>
                    <p class="">You are connected with {meet.store.remoteUser}</p>
                </Show>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <Stream muted stream={meet.store.currentStream} />
                <Stream muted={false} stream={meet.store.remoteStream} />
            </div>

            <div class="md:flex md:gap-2">
                <Controls meet={meet} />
                <TextChat messages={meet.store.messages} sendMessage={meet.sendMessage} />
            </div>
        </div>

    );
}
