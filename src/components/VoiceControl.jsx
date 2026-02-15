import { useState } from 'react'
import { Activity, Camera, Headphones, Mic, PhoneOff, ScreenShare, Settings } from 'lucide-react'

function VoiceControl({
  isConnected,
  channelName,
  serverName,
  currentUserName,
  currentUserImageUrl,
  isMuted,
  onToggleMute,
  onDisconnect,
  onEditProfile,
}) {
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isHeadphonesOn, setIsHeadphonesOn] = useState(false)

  if (!isConnected) {
    return null
  }

  return (
    <div className="w-full rounded-md border border-white/5 bg-[#1E1F22] text-[10px] text-slate-300">
      <div className="flex h-12 items-center justify-between gap-3 px-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-[#23a559]">Voice Connected</div>
          <div className="mt-0.5 truncate text-[9px] text-slate-500">
            {(channelName || 'General') + ' / ' + (serverName || 'Server')}
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#2a2d36]">
            <Activity size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDisconnect?.()}
            className="flex h-7 w-7 items-center justify-center rounded-md text-rose-300 hover:bg-[#2a2d36]"
          >
            <PhoneOff size={14} />
          </button>
        </div>
      </div>

      <div className="border-t border-white/5 px-3">
        <div className="flex h-14 items-center justify-between">
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onToggleMute?.()}
              className={`flex h-10 w-10 items-center justify-center rounded-md ${
                !isMuted ? 'bg-[#2b2d31]' : 'bg-[#1E1F22]'
              } text-slate-200 hover:bg-[#313338]`}
            >
              <Mic size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsVideoOn((prev) => !prev)}
              className={`flex h-10 w-10 items-center justify-center rounded-md ${
                isVideoOn ? 'bg-[#2b2d31]' : 'bg-[#1E1F22]'
              } text-slate-200 hover:bg-[#313338]`}
            >
              <Camera size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsSharing((prev) => !prev)}
              className={`flex h-10 w-10 items-center justify-center rounded-md ${
                isSharing ? 'bg-[#2b2d31]' : 'bg-[#1E1F22]'
              } text-slate-200 hover:bg-[#313338]`}
            >
              <ScreenShare size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsHeadphonesOn((prev) => !prev)}
              className={`flex h-10 w-10 items-center justify-center rounded-md ${
                isHeadphonesOn ? 'bg-[#2b2d31]' : 'bg-[#1E1F22]'
              } text-slate-200 hover:bg-[#313338]`}
            >
              <Headphones size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 px-3">
        <div className="flex h-12 items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-[#111318] flex items-center justify-center overflow-hidden">
            {currentUserImageUrl ? (
              <img src={currentUserImageUrl} alt={currentUserName || 'Profil'} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[11px] font-semibold text-slate-300">
                {(currentUserName || 'U')[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-slate-100">
              {currentUserName || 'Yüklənir...'}
            </p>
            <p className="text-[9px] text-slate-500">{currentUserName ? 'Online' : 'Yüklənir...'}</p>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <button type="button" onClick={() => onToggleMute?.()} className="hover:text-slate-200">
              <Mic size={14} />
            </button>
            <button type="button" className="hover:text-slate-200">
              <Headphones size={14} />
            </button>
            <button type="button" onClick={() => onEditProfile?.()} className="hover:text-slate-200">
              <Settings size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceControl
