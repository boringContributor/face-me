import { AiFillAudio, AiOutlineAudioMuted } from "solid-icons/ai"
import { FiCamera, FiCameraOff } from "solid-icons/fi"
import { Component, Show } from "solid-js"
import { UseMeet } from "../hooks/use-meet"

type ControlsProps = {
    meet: UseMeet
}
export const Controls: Component<ControlsProps> = (props) => {

    return <div class="flex flex-col md:h-full md:w-1/3 rounded-lg border border-gray-200 overflow-hidden p-5">
        <Show when={props.meet.store.hasOpenConnection}>
            <p class="">You are connected with {props.meet.store.remoteUser}</p>
        </Show>
        <Show when={props.meet.store.peer}>
            <span class="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3"><span class="animate-pulse flex w-2.5 h-2.5 bg-green-500 rounded-full me-1.5 flex-shrink-0"></span>You are connected with the peer server {props.meet.store.peer?.id}</span>
        </Show>
        <Show when={!props.meet.store.peer}>
            <span class="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3"><span class="animate-pulse flex w-2.5 h-2.5 bg-red-600 rounded-full me-1.5 flex-shrink-0"></span>You are disconnected from the peer server</span>
        </Show>
        <div>
      <label class="block text-sm font-medium leading-6 text-gray-900">
        User ID
      </label>
      <div class="mt-2">
        <input
            onInput={e => props.meet.setStore("userToCall", e.target.value)} 
            type="text"
            name="User ID"
            id="user-id"
            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
            placeholder="242342"
        />
      </div>
    </div>
        <button onClick={props.meet.connectWithUser}>Connect</button>
        <Show when={props.meet.store.hasOpenConnection}>
            <button onClick={props.meet.stopCall}>Stop</button>
        </Show>
        <div class="flex gap-2">
            <div>
                <Show when={props.meet.store.cameraEnabled}>
                    <button class="m-5" onClick={props.meet.toggleVideo}>
                        <FiCameraOff />
                    </button>

                </Show>
                <Show when={!props.meet.store.cameraEnabled}>
                    <button class="m-5" onClick={props.meet.toggleVideo}>
                        <FiCamera />
                    </button>
                </Show>
            </div>
            <div>
                <Show when={props.meet.store.audioEnabled}>
                    <button class="m-5" onClick={props.meet.toggleMute}>
                        <AiFillAudio />
                    </button>
                </Show>
                <Show when={!props.meet.store.audioEnabled}>
                    <button class="m-5" onClick={props.meet.toggleMute}>
                        <AiOutlineAudioMuted />
                    </button>
                </Show>
            </div>
        </div>
    </div>
}