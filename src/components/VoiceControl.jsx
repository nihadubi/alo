import { useState } from 'react'
import { Activity, Headphones, Mic, PhoneOff, ScreenShare, Settings, Video } from 'lucide-react'

function VoiceControl({
  isConnected,
  channelName,
  serverName,
  isMuted,
  onToggleMute,
  onDisconnect,
}) {
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isVolumeOpen, setIsVolumeOpen] = useState(false)

  if (!isConnected) {
    return null
  }

  return (
    <div className="rounded-md border border-[#2b2d31] bg-[#1e1f22] px-3 py-2 text-[10px] text-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-emerald-400">Voice Connected</div>
          <div className="mt-0.5 text-[9px] text-slate-500">
            {(channelName || 'kanal-adı') + ' / ' + (serverName || 'server-adı')}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1e1f22] text-slate-300 hover:bg-[#2a2d36]"
          >
            <Activity size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDisconnect?.()}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1e1f22] text-rose-300 hover:bg-[#2a2d36]"
          >
            <PhoneOff size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => onToggleMute?.()}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            !isMuted ? 'bg-[#2b2d31]' : 'bg-[#1e1f22]'
          } text-slate-200 hover:bg-[#313338]`}
        >
          <Mic size={14} />
        </button>
        <button
          type="button"
          onClick={() => setIsVideoOn((prev) => !prev)}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            isVideoOn ? 'bg-[#2b2d31]' : 'bg-[#1e1f22]'
          } text-slate-200 hover:bg-[#313338]`}
        >
          <Video size={14} />
        </button>
        <button
          type="button"
          onClick={() => setIsSharing((prev) => !prev)}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            isSharing ? 'bg-[#2b2d31]' : 'bg-[#1e1f22]'
          } text-slate-200 hover:bg-[#313338]`}
        >
          <ScreenShare size={14} />
        </button>
        <button
          type="button"
          onClick={() => setIsVolumeOpen((prev) => !prev)}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            isVolumeOpen ? 'bg-[#2b2d31]' : 'bg-[#1e1f22]'
          } text-slate-200 hover:bg-[#313338]`}
        >
          <Headphones size={14} />
        </button>
      </div>
    </div>
  )
}

export default VoiceControl
