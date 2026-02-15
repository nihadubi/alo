import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
} from '@livekit/components-react'

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

function VoiceParticipantsSync({ onParticipantsChange }) {
  const room = useRoomContext()

  useEffect(() => {
    if (!room || !onParticipantsChange) {
      return
    }

    const emit = () => {
      const allParticipants = [room.localParticipant, ...Array.from(room.remoteParticipants.values())].filter(Boolean)
      const payload = allParticipants.map((participant) => ({
        identity: participant.identity,
        name: participant.name || participant.identity || 'İstifadəçi',
        isSpeaking: participant.isSpeaking,
      }))
      onParticipantsChange(payload)
    }

    emit()
    room.on('participantConnected', emit)
    room.on('participantDisconnected', emit)
    room.on('activeSpeakersChanged', emit)

    return () => {
      room.off('participantConnected', emit)
      room.off('participantDisconnected', emit)
      room.off('activeSpeakersChanged', emit)
      onParticipantsChange([])
    }
  }, [onParticipantsChange, room])

  return null
}

function MicSync({ micEnabled }) {
  const room = useRoomContext()

  useEffect(() => {
    if (!room || typeof micEnabled !== 'boolean') {
      return
    }
    const update = () => {
      if (room.state === 'connected') {
        room.localParticipant?.setMicrophoneEnabled(micEnabled)
      }
    }
    update()
    room.on('connected', update)
    room.on('reconnected', update)
    return () => {
      room.off('connected', update)
      room.off('reconnected', update)
    }
  }, [micEnabled, room])

  return null
}

function MediaRoom({ roomName, onConnectionChange, onParticipantsChange, micEnabled }) {
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
    return null
  }

  if (!livekitToken || !serverUrl) {
    return null
  }

  return (
    <LiveKitRoom
      token={livekitToken}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={false}
      onConnected={() => onConnectionChange?.(true)}
      onDisconnected={() => onConnectionChange?.(false)}
      data-lk-theme="default"
      className="hidden"
    >
      <RoomAudioRenderer />
      <RoomCleanup onConnectionChange={onConnectionChange} />
      <VoiceParticipantsSync onParticipantsChange={onParticipantsChange} />
      <MicSync micEnabled={micEnabled} />
    </LiveKitRoom>
  )
}

export default MediaRoom
