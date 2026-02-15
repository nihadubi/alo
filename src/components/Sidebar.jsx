import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Headphones, MessageCircle, Mic, Plus, Settings } from 'lucide-react'
import { UserButton, useAuth } from '@clerk/clerk-react'
import VoiceControl from './VoiceControl.jsx'

function Sidebar({
  activeChannel,
  onChannelChange,
  isVoiceLive,
  isDM,
  onToggleDM,
  voiceChannel,
  voiceParticipants,
  onJoinAudio,
  onDisconnectVoice,
  members,
  currentUserName,
  currentUserImageUrl,
  currentUserId,
  displayName,
  onDisplayNameChange,
  isMuted,
  onToggleMute,
}) {
  const { getToken, isSignedIn } = useAuth()
  const [communities, setCommunities] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [channelsByCommunity, setChannelsByCommunity] = useState({})
  const [isChannelOpen, setIsChannelOpen] = useState(false)
  const [channelName, setChannelName] = useState('')
  const [channelType, setChannelType] = useState('TEXT')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileError, setProfileError] = useState('')
  const [isProfileSaving, setIsProfileSaving] = useState(false)

  useEffect(() => {
    if (!isSignedIn) {
      return
    }

    const loadCommunities = async () => {
      try {
        const token = await getToken()
        if (!token) {
          return
        }
        const response = await axios.get('/api/communities', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (Array.isArray(response.data)) {
          setCommunities(response.data)
        }
      } catch (error) {
        console.error('Communities fetch failed', error)
      }
    }

    loadCommunities()
  }, [getToken, isSignedIn])

  useEffect(() => {
    if (!communities.length) {
      if (!activeChannel?.id) {
        onChannelChange?.({ type: 'text', name: 'General', id: null })
      }
      return
    }

    if (!activeChannel?.id) {
      const first = communities[0]
      onChannelChange?.({ type: 'text', name: 'General', id: first?.id || null })
    }
  }, [activeChannel?.id, communities, onChannelChange])

  useEffect(() => {
    if (!communities.length) {
      return
    }
    setChannelsByCommunity((prev) => {
      const next = { ...prev }
      communities.forEach((community) => {
        if (!next[community.id]) {
          next[community.id] = {
            text: [{ id: 'text-general', name: 'General', type: 'TEXT' }],
            audio: [{ id: 'audio-general', name: 'General', type: 'AUDIO' }],
          }
        }
      })
      return next
    })
  }, [communities])

  const getInitials = (name) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')

  const dmUsers = []

  const activeCommunityId = activeChannel?.id || (communities[0]?.id ?? null)
  const activeChannels = useMemo(() => {
    if (!activeCommunityId) {
      return { text: [], audio: [] }
    }
    return channelsByCommunity[activeCommunityId] || { text: [], audio: [] }
  }, [activeCommunityId, channelsByCommunity])

  const memberImageByIdentity = useMemo(() => {
    const map = new Map()
    if (Array.isArray(members)) {
      members.forEach((member) => {
        if (member?.userId && !map.has(member.userId)) {
          map.set(member.userId, member.imageUrl || '')
        }
      })
    }
    if (currentUserId && currentUserImageUrl && !map.has(currentUserId)) {
      map.set(currentUserId, currentUserImageUrl)
    }
    return map
  }, [currentUserId, currentUserImageUrl, members])

  const memberNameByIdentity = useMemo(() => {
    const map = new Map()
    if (Array.isArray(members)) {
      members.forEach((member) => {
        if (member?.userId && !map.has(member.userId)) {
          map.set(member.userId, member.name || '')
        }
      })
    }
    if (currentUserId && currentUserName && !map.has(currentUserId)) {
      map.set(currentUserId, currentUserName)
    }
    return map
  }, [currentUserId, currentUserName, members])

  const activeCommunityName = useMemo(() => {
    if (!activeCommunityId) {
      return ''
    }
    return communities.find((community) => community.id === activeCommunityId)?.name || ''
  }, [activeCommunityId, communities])

  const handleCreateChannel = () => {
    const name = channelName.trim()
    if (!name || !activeCommunityId) {
      return
    }
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${channelType}-${name}`
    setChannelsByCommunity((prev) => {
      const current = prev[activeCommunityId] || { text: [], audio: [] }
      const next = { ...prev }
      if (channelType === 'TEXT') {
        next[activeCommunityId] = {
          ...current,
          text: [...current.text, { id, name, type: 'TEXT' }],
        }
      } else {
        next[activeCommunityId] = {
          ...current,
          audio: [...current.audio, { id, name, type: 'AUDIO' }],
        }
      }
      return next
    })
    setChannelName('')
    setChannelType('TEXT')
    setIsChannelOpen(false)
  }

  const handleOpenProfile = () => {
    setProfileName(displayName || '')
    setProfileError('')
    setIsProfileOpen(true)
  }

  const handleSaveProfile = async () => {
    const name = profileName.trim()
    if (!name) {
      setProfileError('Ad boş ola bilməz')
      return
    }
    if (name.length < 2 || name.length > 32) {
      setProfileError('Ad 2-32 simvol arası olmalıdır')
      return
    }
    try {
      setIsProfileSaving(true)
      const token = await getToken()
      if (!token) {
        setProfileError('Profil yenilənmədi')
        return
      }
      const response = await axios.post(
        '/api/profile/update',
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const updatedName = response?.data?.profile?.name || name
      onDisplayNameChange?.(updatedName)
      setIsProfileOpen(false)
      setProfileError('')
    } catch (error) {
      console.error('Profile update failed', error)
      setProfileError('Profil yenilənmədi')
    } finally {
      setIsProfileSaving(false)
    }
  }

  const handleCreateCommunity = async () => {
    const name = communityName.trim()
    if (!name || isCreating) {
      return
    }

    try {
      setIsCreating(true)
      const token = await getToken()
      if (!token) {
        return
      }
      const response = await axios.post(
        '/api/communities',
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      if (response.data?.id) {
        setCommunities((prev) => [response.data, ...prev])
        setCommunityName('')
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Community create failed', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <aside className="w-[280px] bg-[#1E1F22] flex text-slate-200">
      <div className="w-[72px] flex flex-col items-center py-4 border-r border-black/20 h-full">
        <button
          type="button"
          onClick={() => onToggleDM?.()}
          className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${
            isDM ? 'bg-indigo-500/90 text-white' : 'bg-[#2B2D31] text-slate-200 hover:bg-[#3b3d43]'
          }`}
        >
          <MessageCircle size={18} />
        </button>

        <button
          className="mt-4 h-11 w-11 rounded-xl bg-[#2B2D31] text-slate-200 flex items-center justify-center hover:bg-indigo-500/80 transition-colors"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          <Plus size={18} />
        </button>

        <div className="flex-1 w-full mt-4 flex flex-col items-center gap-3 overflow-y-auto custom-scrollbar">
          {communities.map((community) => (
            <button
              key={community.id}
              type="button"
              onClick={() =>
                onChannelChange?.({ type: 'text', name: community.name || 'Ümumi söhbət', id: community.id })
              }
              className={`h-11 w-11 rounded-xl text-slate-200 flex items-center justify-center text-xs font-semibold transition-colors ${
                activeChannel?.type === 'text' && activeChannel?.id === community.id
                  ? 'bg-indigo-500/80'
                  : 'bg-[#2B2D31] hover:bg-[#3b3d43]'
              }`}
            >
              {getInitials(community.name || '') || 'C'}
            </button>
          ))}
        </div>

      </div>

      <div className="flex-1 flex flex-col px-4 py-4 h-full">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {isDM ? 'Direct Messages' : 'Server Kanalları'}
          </p>
          {!isDM ? (
            <button
              type="button"
              onClick={() => setIsChannelOpen(true)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              + Kanal
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {isDM ? (
            dmUsers.length === 0 ? (
              <div className="text-xs text-slate-500">DM yoxdur</div>
            ) : (
              dmUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="w-full flex items-center gap-3 rounded-xl bg-[#2B2D31] px-3 py-2 text-left hover:bg-[#3b3d43]"
                >
                  <div className="h-9 w-9 rounded-full bg-[#111318] flex items-center justify-center text-xs font-semibold">
                    {getInitials(user.name || 'U')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">{user.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">DM</p>
                  </div>
                </button>
              ))
            )
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Text kanallar</p>
              {activeChannels.text.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() =>
                    onChannelChange?.({ type: 'text', name: channel.name, id: activeCommunityId })
                  }
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                    activeChannel?.type === 'text' && activeChannel?.name === channel.name
                      ? 'bg-indigo-500/20 text-white'
                      : 'bg-[#2B2D31] hover:bg-[#3b3d43]'
                  }`}
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">#</span>
                  <span className="text-sm font-medium text-slate-200">{channel.name}</span>
                </button>
              ))}
              <div className="pt-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Səsli kanallar</p>
                <div className="mt-2 space-y-2">
                  {activeChannels.audio.map((channel) => (
                    <div key={channel.id}>
                      <button
                        type="button"
                        onClick={() => onJoinAudio?.({ type: 'audio', name: channel.name, id: channel.id })}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                          voiceChannel?.id === channel.id
                            ? 'bg-indigo-500/20 text-white'
                            : 'bg-[#2B2D31] hover:bg-[#3b3d43]'
                        }`}
                      >
                        <span className="text-sm font-medium text-slate-200">{channel.name}</span>
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${isVoiceLive ? 'bg-emerald-400' : 'bg-slate-500'}`}
                        />
                      </button>
                      {voiceChannel?.id === channel.id ? (
                        <div className="mt-2 w-full space-y-2 pl-3">
                          {voiceParticipants.length === 0 ? (
                            <div className="text-xs text-slate-500">Heç kim qoşulmayıb</div>
                          ) : (
                            voiceParticipants.map((participant) => {
                              const identity = participant.identity
                              const isSelf = identity && identity === currentUserId
                              const imageUrl =
                                (isSelf ? currentUserImageUrl : memberImageByIdentity.get(identity)) || ''
                              const resolvedName =
                                (isSelf ? currentUserName : memberNameByIdentity.get(identity)) || participant.name || ''
                              const fallbackName = resolvedName || 'Yüklənir...'
                              return (
                                <div
                                  key={participant.identity}
                                  className="flex w-full items-center gap-2 rounded-lg bg-[#1E1F22] px-2 py-1 text-xs text-slate-200"
                                >
                                  <div
                                    className={`h-5 w-5 rounded-full bg-[#111318] flex items-center justify-center text-[9px] font-semibold text-slate-300 overflow-hidden ${
                                      participant.isSpeaking ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#1E1F22]' : ''
                                    }`}
                                  >
                                    {imageUrl ? (
                                      <img src={imageUrl} alt={fallbackName} className="h-full w-full object-cover" />
                                    ) : (
                                      getInitials(fallbackName || '') || 'U'
                                    )}
                                  </div>
                                  <span className="min-w-0 flex-1 truncate">{fallbackName}</span>
                                </div>
                              )
                            })
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {voiceChannel ? (
          <div className="mt-auto w-full pt-3">
            <VoiceControl
              isConnected={Boolean(voiceChannel)}
              channelName={voiceChannel?.name}
              serverName={activeCommunityName}
              currentUserName={currentUserName}
              currentUserImageUrl={currentUserImageUrl}
              isMuted={isMuted}
              onToggleMute={onToggleMute}
              onDisconnect={onDisconnectVoice}
              onEditProfile={handleOpenProfile}
            />
          </div>
        ) : (
          <div className="mt-auto" />
        )}

        {!voiceChannel ? (
          <div className="mt-2 rounded-md border border-[#2b2d31] bg-[#1e1f22] px-2 py-2 text-[10px] text-slate-300">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-[#111318] flex items-center justify-center overflow-hidden">
                <UserButton afterSignOutUrl="/" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-slate-100">{displayName || 'nihad'}</p>
                <p className="text-[9px] text-slate-500">Online</p>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <button type="button" onClick={() => onToggleMute?.()} className="hover:text-slate-200">
                  <Mic size={14} />
                </button>
                <button type="button" className="hover:text-slate-200">
                  <Headphones size={14} />
                </button>
                <button type="button" onClick={handleOpenProfile} className="hover:text-slate-200">
                  <Settings size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl bg-[#2B2D31] p-6 text-slate-200 shadow-2xl">
            <h2 className="text-lg font-semibold">İcma yarat</h2>
            <p className="mt-1 text-xs text-slate-400">Yeni icma adı daxil edin</p>
            <input
              type="text"
              value={communityName}
              onChange={(event) => setCommunityName(event.target.value)}
              placeholder="Məsələn: Dizayn"
              className="mt-4 w-full rounded-xl bg-[#1E1F22] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-slate-500/50"
            />
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setCommunityName('')
                }}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Bağla
              </button>
              <button
                type="button"
                onClick={handleCreateCommunity}
                disabled={isCreating}
                className="rounded-lg bg-indigo-500/80 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {isCreating ? 'Yaradılır...' : 'Yarat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl bg-[#2B2D31] p-6 text-slate-200 shadow-2xl">
            <h2 className="text-lg font-semibold">Kanal yarat</h2>
            <p className="mt-1 text-xs text-slate-400">Kanal növü seçin</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setChannelType('TEXT')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  channelType === 'TEXT'
                    ? 'bg-indigo-500/80 text-white'
                    : 'bg-[#1E1F22] text-slate-400 hover:text-slate-200'
                }`}
              >
                Mətn
              </button>
              <button
                type="button"
                onClick={() => setChannelType('AUDIO')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  channelType === 'AUDIO'
                    ? 'bg-indigo-500/80 text-white'
                    : 'bg-[#1E1F22] text-slate-400 hover:text-slate-200'
                }`}
              >
                Səs
              </button>
            </div>
            <input
              type="text"
              value={channelName}
              onChange={(event) => setChannelName(event.target.value)}
              placeholder="Məsələn: meeting"
              className="mt-4 w-full rounded-xl bg-[#1E1F22] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-slate-500/50"
            />
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsChannelOpen(false)
                  setChannelName('')
                  setChannelType('TEXT')
                }}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Bağla
              </button>
              <button
                type="button"
                onClick={handleCreateChannel}
                className="rounded-lg bg-indigo-500/80 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Yarat
              </button>
            </div>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-2xl bg-[#2B2D31] p-6 text-slate-200 shadow-2xl">
            <h2 className="text-lg font-semibold">Profil adı</h2>
            <p className="mt-1 text-xs text-slate-400">Yeni adını daxil et</p>
            <input
              type="text"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Məsələn: Nihadbey"
              className="mt-4 w-full rounded-xl bg-[#1E1F22] px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-slate-500/50"
            />
            {profileError ? <div className="mt-2 text-xs text-red-400">{profileError}</div> : null}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Bağla
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isProfileSaving}
                className="rounded-lg bg-indigo-500/80 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Yadda saxla
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
