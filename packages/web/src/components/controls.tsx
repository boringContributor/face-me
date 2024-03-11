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
            <span class="flex items-center text-sm font-medium text-white me-3"><span class="animate-pulse flex w-2.5 h-2.5 bg-green-500 rounded-full me-1.5 flex-shrink-0"></span>You are connected with the peer server {props.meet.store.peer?.id}</span>
        </Show>
        <Show when={!props.meet.store.peer}>
            <span class="flex items-center text-sm font-medium  text-white me-3"><span class="animate-pulse flex w-2.5 h-2.5 bg-red-600 rounded-full me-1.5 flex-shrink-0"></span>You are disconnected from the peer server</span>
        </Show>
        <div>
        </div>
        <div class="flex-row gap-2">
            <div class="flex gap-2">
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
            <Show when={props.meet.store.socket && props.meet.store.hasOpenConnection}>
                <div class="flex gap-5">
                    <button class="border border-white rounded p-3" onClick={props.meet.startCall}>Start</button>
                    <button class="border border-white rounded p-3" onClick={props.meet.stopCall}>Stop</button>
                </div>
            </Show>
        </div>
    </div>
}