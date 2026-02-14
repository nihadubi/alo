import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { Track } from 'livekit-client'
import {
  AudioConference,
  BarVisualizer,
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useTracks,
} from '@livekit/components-react'

function AudioLevel() {
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: false })
  const trackRef = useMemo(
    () => tracks.find((track) => track.participant.isLocal) || tracks[0],
    [tracks],
  )

  if (!trackRef) {
    return <div className="text-xs text-slate-500">Mikrofon aktiv deyil</div>
  }

  return <BarVisualizer trackRef={trackRef} barCount={12} className="h-8 w-full" />
}

function RoomCleanup({ onConnectionChange }) {
  const room = useRoomContext()

  useEffect(() => {
    return () => {
      onConnectionChange?.(false)
      room.localParticipant?.setMicrophoneEnabled(false)
      room.disconnect()
    }
  }, [onConnectionChange, room])

  return null
}

function MediaRoom({ roomName, onConnectionChange }) {
  const { getToken, isSignedIn } = useAuth()
  const [livekitToken, setLivekitToken] = useState('')
  const [serverUrl, setServerUrl] = useState('')
  const [tokenError, setTokenError] = useState('')

  useEffect(() => {
    if (!isSignedIn || !roomName) {
      return
    }

    const loadToken = async () => {
      try {
        setLivekitToken('')
        setServerUrl('')
        setTokenError('')
        const token = await getToken()
        if (!token) {
          setTokenError('Səs serverinə qoşulmaq mümkün olmadı')
          return
        }
        const response = await axios.post(
          '/api/livekit/token',
          { roomName },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        if (response.data?.token) {
          setLivekitToken(response.data.token)
          setServerUrl(response.data.url)
        }
      } catch (error) {
        console.error('LiveKit token failed', error)
        setTokenError('Səs serverinə qoşulmaq mümkün olmadı')
      }
    }

    loadToken()
  }, [getToken, isSignedIn, roomName])

  if (tokenError) {
    return (
      <main className="flex-1 flex flex-col bg-[#313338] text-slate-200">
        <div className="h-16 px-6 flex items-center justify-between border-b border-black/20">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Səsli otaq</p>
            <h2 className="text-lg font-semibold text-slate-100">{roomName}</h2>
          </div>
          <div className="text-xs text-slate-500">Xəta</div>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-red-400">
          {tokenError}
        </div>
      </main>
    )
  }

  if (!livekitToken || !serverUrl) {
    return (
      <main className="flex-1 flex flex-col bg-[#313338] text-slate-200">
        <div className="h-16 px-6 flex items-center justify-between border-b border-black/20">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Səsli otaq</p>
            <h2 className="text-lg font-semibold text-slate-100">{roomName}</h2>
          </div>
          <div className="text-xs text-slate-500">Yüklənir</div>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
          Canlı otaq hazırlanır...
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col bg-[#313338] text-slate-200">
      <div className="h-16 px-6 flex items-center justify-between border-b border-black/20">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Səsli otaq</p>
          <h2 className="text-lg font-semibold text-slate-100">{roomName}</h2>
        </div>
        <div className="text-xs text-slate-500">Aktiv</div>
      </div>

      <LiveKitRoom
        token={livekitToken}
        serverUrl={serverUrl}
        connect={true}
        audio={true}
        video={false}
        onConnected={() => onConnectionChange?.(true)}
        onDisconnected={() => onConnectionChange?.(false)}
        data-lk-theme="default"
        className="flex-1 flex flex-col"
      >
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="rounded-2xl bg-[#2B2D31] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">İştirakçılar</p>
            <div className="mt-4">
              <AudioConference />
            </div>
          </div>
          <div className="rounded-2xl bg-[#2B2D31] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Səs səviyyəsi</p>
            <div className="mt-3">
              <AudioLevel />
            </div>
          </div>
        </div>

        <div className="border-t border-black/20 px-6 py-4">
          <ControlBar variation="minimal" />
        </div>

        <RoomAudioRenderer />
        <RoomCleanup onConnectionChange={onConnectionChange} />
      </LiveKitRoom>
    </main>
  )
}

export default MediaRoom
