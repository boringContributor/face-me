import { Component, createEffect, onMount } from "solid-js";

type StreamProps = {
  stream: MediaStream | null;
  muted: boolean;
}

export function getVideoSrc(el: HTMLVideoElement, accessor: () => MediaStream | null) {
  const mediaStream = accessor();
  if ("srcObject" in el) {
    el.srcObject = mediaStream;
  } else {
    // @ts-ignore
    el.src = window.URL.createObjectURL(mediaStream);
  }
}

export const Stream: Component<StreamProps> = (props) => {
  let videoRef: HTMLVideoElement;

  onMount(() => {
    if (videoRef) videoRef.srcObject = props.stream;
  });

  createEffect(() => {
    if (videoRef && props.stream) {
      videoRef.srcObject = props.stream;
    }
  });

  return (
    <video
      class="w-full aspect-video bg-black rounded-lg"
      autoplay
      controls={false}
      playsinline
      muted={props.muted}
      ref={videoRef!}
    ></video>
  );
}