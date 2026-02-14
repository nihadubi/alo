import { useEffect, useState } from 'react'
import axios from 'axios'
import { MessageCircle, Plus } from 'lucide-react'
import { UserButton, useAuth } from '@clerk/clerk-react'

function Sidebar({ activeChannel, onChannelChange, isVoiceLive, isDM, onToggleDM }) {
  const { getToken, isSignedIn } = useAuth()
  const [communities, setCommunities] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [communityName, setCommunityName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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
      if (!activeChannel?.id && activeChannel?.type !== 'audio') {
        onChannelChange?.({ type: 'text', name: 'General', id: null })
      }
      return
    }

    if (!activeChannel?.id && activeChannel?.type !== 'audio') {
      const first = communities[0]
      onChannelChange?.({ type: 'text', name: first?.name || 'General', id: first?.id || null })
    }
  }, [activeChannel?.id, activeChannel?.type, communities, onChannelChange])

  const getInitials = (name) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')

  const dmUsers = []

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
      <div className="w-[72px] flex flex-col items-center py-4 border-r border-black/20">
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

        <div className="pb-2">
          <div className="h-11 w-11 rounded-xl bg-[#2B2D31] flex items-center justify-center overflow-hidden">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            {isDM ? 'Direct Messages' : 'Server Kanalları'}
          </p>
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
            communities.map((community) => (
              <button
                key={community.id}
                type="button"
                onClick={() =>
                  onChannelChange?.({ type: 'text', name: community.name || 'Ümumi söhbət', id: community.id })
                }
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  activeChannel?.type === 'text' && activeChannel?.id === community.id
                    ? 'bg-indigo-500/20 text-white'
                    : 'bg-[#2B2D31] hover:bg-[#3b3d43]'
                }`}
              >
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">#</span>
                <span className="text-sm font-medium text-slate-200">
                  {community.name || 'Ümumi söhbət'}
                </span>
              </button>
            ))
          )}
        </div>

        {!isDM ? (
          <div className="pt-4 border-t border-black/20">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Səsli kanallar</p>
            <button
              type="button"
              onClick={() => onChannelChange?.({ type: 'audio', name: 'General' })}
              className={`mt-3 w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                activeChannel?.type === 'audio' ? 'bg-indigo-500/20 text-white' : 'bg-[#2B2D31] hover:bg-[#3b3d43]'
              }`}
            >
              <span className="text-sm font-medium text-slate-200">General</span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${isVoiceLive ? 'bg-emerald-400' : 'bg-slate-500'}`}
              />
            </button>
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
    </aside>
  )
}

export default Sidebar
