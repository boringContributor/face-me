
type StreamProps = {
  stream: MediaStream | null;
  name: string;
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

export const Stream = (props: StreamProps) => {
  return (
    <video
      class="w-full aspect-video bg-black rounded-lg"
      autoplay
      controls={false}
      playsinline
      // @ts-ignore
      use:getVideoSrc={props.stream}
    ></video>
  );
}