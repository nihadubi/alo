import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus } from 'lucide-react'
import { UserButton, useAuth } from '@clerk/clerk-react'

function Sidebar({ activeChannel, onChannelChange, isVoiceLive }) {
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
    <aside className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-4">
      <button
        className="h-12 w-12 rounded-2xl bg-[#313338] text-slate-200 flex items-center justify-center hover:bg-indigo-500/80 transition-colors"
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
            className={`h-12 w-12 rounded-full text-slate-200 flex items-center justify-center text-xs font-semibold transition-colors ${
              activeChannel?.type === 'text' && activeChannel?.id === community.id
                ? 'bg-indigo-500/80'
                : 'bg-[#2B2D31]'
            }`}
          >
            {getInitials(community.name || '') || 'C'}
          </button>
        ))}
      </div>

      <div className="w-full px-3 pb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 text-center">
          Səsli Kanallar
        </p>
        <div className="mt-3 flex items-center justify-center">
          <button
            type="button"
            onClick={() => onChannelChange?.({ type: 'audio', name: 'General' })}
            className={`relative h-9 w-9 rounded-full text-[10px] text-slate-200 flex items-center justify-center transition-colors ${
              activeChannel?.type === 'audio' ? 'bg-indigo-500/80' : 'bg-[#2B2D31]'
            }`}
          >
            General
            {isVoiceLive ? (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            ) : null}
          </button>
        </div>
      </div>

      <div className="pb-2">
        <div className="h-12 w-12 rounded-2xl bg-[#313338] flex items-center justify-center overflow-hidden">
          <UserButton afterSignOutUrl="/" />
        </div>
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
