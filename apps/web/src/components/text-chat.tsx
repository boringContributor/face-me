import { For, createSignal, Component, createEffect } from "solid-js"
import { useKeyDownEvent } from "@solid-primitives/keyboard";

type Message = {
    sender: "local" | "remote";
    content: string;
    timestamp: Date;
}
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
        <div class="flex flex-col h-[480px] rounded-lg border border-gray-200">
            <div class="flex flex-col h-full">
                <For each={props.messages}>{(msg) =>
                    <div class="flex flex-col items-start space-y-1">
                        <div class="flex items-center space-x-2">
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


                <div class="border-t border-gray-200 dark:border-gray-800 p-4">
                    <form class="flex space-x-2">
                        <textarea value={message()} class="flex-1 border border-gray-200 dark:border-gray-800 rounded-md p-2 focus:outline-none" placeholder="Type a message" onInput={evt => setMessage(evt.currentTarget.value)} />
                        <button class="rounded-md bg-green-500 text-white font-semibold px-4 py-2" type="button" onClick={() => {
                            props.sendMessage(message())
                            setMessage("")
                        }}>Send</button>
                    </form>
                </div>
            </div>
        </div>
    )
}


function formatMessageDate(date: Date) {
    return `${date.getHours()}:${date.getMinutes()}`
  }
