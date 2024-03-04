import { Toaster } from 'solid-toast'
import { VideoChat } from './components/video-chat'

const App = () => {
  return <div class="md:h-full absolute top-0 z-[-2] w-screen bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px] text-white">
    <Toaster />
    <VideoChat />
  </div>
}

export default App;