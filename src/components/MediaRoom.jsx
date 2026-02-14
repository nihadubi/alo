import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { Track } from 'livekit-client'
import {
  BarVisualizer,
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
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

function ParticipantsGrid() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone])

  if (!tracks.length) {
    return <div className="text-xs text-slate-500">Heç kim qoşulmayıb</div>
  }

  return (
    <GridLayout tracks={tracks}>
      {tracks.map((track) => (
        <ParticipantTile key={`${track.participant.identity}-${track.source}`} trackRef={track} />
      ))}
    </GridLayout>
  )
}

function MediaRoom({ roomName }) {
  const { getToken, isSignedIn } = useAuth()
  const [livekitToken, setLivekitToken] = useState('')
  const [serverUrl, setServerUrl] = useState('')

  useEffect(() => {
    if (!isSignedIn || !roomName) {
      return
    }

    const loadToken = async () => {
      try {
        const token = await getToken()
        if (!token) {
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
      }
    }

    loadToken()
  }, [getToken, isSignedIn, roomName])

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
        connect
        audio
        video={false}
        data-lk-theme="default"
        className="flex-1 flex flex-col"
      >
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="rounded-2xl bg-[#2B2D31] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Səs səviyyəsi</p>
            <div className="mt-3">
              <AudioLevel />
            </div>
          </div>

          <div className="rounded-2xl bg-[#2B2D31] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">İştirakçılar</p>
            <div className="mt-4">
              <ParticipantsGrid />
            </div>
          </div>
        </div>

        <div className="border-t border-black/20 px-6 py-4">
          <ControlBar variation="minimal" />
        </div>

        <RoomAudioRenderer />
      </LiveKitRoom>
    </main>
  )
}

export default MediaRoom
