import { For, createSignal, Component, createEffect } from "solid-js"
import { useKeyDownEvent } from "@solid-primitives/keyboard";
import { AiOutlineSend } from 'solid-icons/ai'
import type { Message } from "../zod";

type TextChatProps = {
    messages: Array<Message>;
    sendMessage: (msg: string) => void;
}

export const TextChat: Component<TextChatProps> = (props) => {
    const [message, setMessage] = createSignal("")
    const event = useKeyDownEvent();

    createEffect(() => {
        const e = event();

        if (e?.key === 'Enter' && !e.shiftKey && message() !== "") {
            e.preventDefault(); // Prevent the form from submitting in a traditional way
            props.sendMessage(message());
            setMessage(""); // Clear the message after sending
        }
    });

    return (
        <div class="flex flex-col h-[400px] w-full rounded-lg border border-gray-200 overflow-hidden">
            {/* Messages Container */}
            <div class="flex-1 overflow-y-auto scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-white scrollbar-track-slate-300 space-y-3">
                <For each={props.messages}>{(msg) =>
                    <div class={`flex flex-col ${msg.sender === 'local' ? 'items-end' : 'items-start'} px-5`}>
                        <div class="flex items-center">
                            <p class="text-sm">{
                                msg.sender === "local" ? "You" : "Remote"
                            }: {msg.content}
                            </p>
                        </div>
                        <time class="text-sm text-gray-500 dark:text-gray-400" dateTime="2023-10-01T16:12:00Z">
                            {formatMessageDate(msg.timestamp)}
                        </time>
                    </div>
                }</For>
            </div>
    
            {/* Input Area */}
            <div class="border-t border-gray-200 dark:border-gray-800 p-4">
                <form class="flex space-x-2">
                    <textarea value={message()} class="text-black flex-1 border border-gray-200 dark:border-gray-800 rounded-md p-2 focus:outline-none" placeholder="Type a message" onInput={evt => setMessage(evt.currentTarget.value)} />
                    <button class="shadow-[0_4px_14px_0_rgb(0,0,0,10%)] hover:shadow-[0_6px_20px_rgba(93,93,93,23%)] px-6 py-2 bg-[#fff] text-[#696969] rounded-md font-light transition duration-200 ease-linear inline-flex items-center gap-2"
                        type="button" onClick={() => {
                            if (message().trim() !== "") {
                                props.sendMessage(message().trim())
                                setMessage("")
                            }
                        }}>Send
                        <AiOutlineSend />
                    </button>
                </form>
            </div>
        </div>
    )
    
    
}


function formatMessageDate(timestamp: string) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date);
}
